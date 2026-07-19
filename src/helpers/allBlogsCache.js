import markdownRoutes from "../config/markdownRoutes";
import { toTitleCase } from "./toTitleCase";
import { extractTitleAndExcerpt } from "./extractTitleAndExcerpt";
import { extractCoverImageFromMarkdown } from "./extractCoverImageFromMarkdown";
import { getRepoDisplayName } from "./getRepoDisplayName";
import { getCachedData, setCachedData } from "./cacheUtils";
import {
  getGitHubHeaders,
  fetchDirectories,
  fetchReadmeContent,
  fetchLastCommitDate,
} from "./githubApi";

export const ALL_BLOGS_CACHE_KEY = "allBlogs_cache_v2";
export const ALL_BLOGS_CACHE_DURATION = 60 * 60 * 1000;

const CACHE_SCHEMA_VERSION = 6;

let allBlogsMemory = null;
let allBlogsRequest = null;

const directoryRepoConfigs = [
  markdownRoutes.ctfWriteupsRepo,
  markdownRoutes.webVulnsRepo,
  markdownRoutes.webLabRepo,
  markdownRoutes.attackLabRepo,
  markdownRoutes.cheatSheetRepo,
];

const rootReadmeRepoConfigs = [
  {
    ...markdownRoutes.licensePlateDetectionRepo,
    displayName: "License Plate Detection",
    detailPath: "/license-plate-detection",
    mode: "root-readme",
  },
  {
    ...markdownRoutes.logAnomalyDetectionRepo,
    displayName: "Log Anomaly Detection",
    detailPath: "/log-anomaly-detection",
    mode: "root-readme",
  },
];

const allRepoConfigs = [...directoryRepoConfigs, ...rootReadmeRepoConfigs];

function getDisplayName(config) {
  return config.displayName || getRepoDisplayName(config.repo);
}

function getRawBaseUrl(config, itemPath = "") {
  const normalizedPath = itemPath ? `${itemPath}/` : "";
  return `https://raw.githubusercontent.com/${config.owner}/${config.repo}/${config.branch}/${normalizedPath}`;
}

function getRepoCacheKey(config) {
  return `${config.owner}/${config.repo}/${config.path || ""}/${config.mode || "dir"}`;
}

function getBlogRepoCacheKey(blog) {
  return `${blog.owner}/${blog.repo}/${blog.repoPath || ""}/${blog.mode || "dir"}`;
}

function hasRequiredRepoKeys(repoKeys) {
  const loaded = new Set(repoKeys || []);
  return allRepoConfigs.every((config) => loaded.has(getRepoCacheKey(config)));
}

function createCachePayload(blogs, repoKeys) {
  return {
    version: CACHE_SCHEMA_VERSION,
    repoKeys,
    blogs,
  };
}

function getBlogsFromPayload(payload) {
  if (
    payload?.version !== CACHE_SCHEMA_VERSION ||
    !Array.isArray(payload.blogs) ||
    !hasRequiredRepoKeys(payload.repoKeys)
  ) {
    return null;
  }

  return payload.blogs;
}

function readAllBlogsCache() {
  const payload = getCachedData(ALL_BLOGS_CACHE_KEY, ALL_BLOGS_CACHE_DURATION);
  const blogs = getBlogsFromPayload(payload);

  if (!blogs) {
    // Invalidate in-memory cache too so stale data is not reused
    allBlogsMemory = null;
    return null;
  }

  allBlogsMemory = blogs;
  return blogs;
}

async function fetchDirectoryBlog(d, config, ghHeaders) {
  const repoPath = config.path || "";
  const itemPath = repoPath ? `${repoPath}/${d.name}` : d.name;
  const detailPath = `${config.basePath || ""}/${d.name}`;

  try {
    const [readmeContent, lastModified] = await Promise.all([
      fetchReadmeContent({
        owner: config.owner,
        repo: config.repo,
        branch: config.branch,
        path: itemPath,
      }),
      fetchLastCommitDate({
        owner: config.owner,
        repo: config.repo,
        branch: config.branch,
        path: itemPath,
        headers: ghHeaders,
      }),
    ]);

    if (!readmeContent) return null;

    const { title, excerpt } = extractTitleAndExcerpt(readmeContent);
    const coverImageUrl = extractCoverImageFromMarkdown(
      readmeContent,
      getRawBaseUrl(config, itemPath)
    );

    return {
      cacheSchemaVersion: CACHE_SCHEMA_VERSION,
      mode: "dir",
      id: d.name,
      slug: d.name,
      title: toTitleCase(title),
      excerpt,
      coverImageUrl,
      link: detailPath,
      detailPath,
      rawUrl: `${getRawBaseUrl(config, itemPath)}README.md`,
      githubUrl: d.html_url,
      owner: config.owner,
      repo: config.repo,
      branch: config.branch,
      repoPath,
      itemPath,
      basePath: config.basePath || "",
      repoDisplayName: getDisplayName(config),
      lastModified,
    };
  } catch {
    return null;
  }
}

async function fetchDirectoryRepo(config, ghHeaders) {
  const dirs = await fetchDirectories({
    owner: config.owner,
    repo: config.repo,
    path: config.path,
    branch: config.branch,
    headers: ghHeaders,
  });

  const blogs = await Promise.all(
    dirs.map((dir) => fetchDirectoryBlog(dir, config, ghHeaders))
  );

  return blogs.filter((blog) => blog !== null);
}

async function fetchRootReadmeRepo(config, ghHeaders) {
  const repoPath = config.path || "";

  try {
    const [readmeContent, lastModified] = await Promise.all([
      fetchReadmeContent({
        owner: config.owner,
        repo: config.repo,
        branch: config.branch,
        path: repoPath,
      }),
      fetchLastCommitDate({
        owner: config.owner,
        repo: config.repo,
        branch: config.branch,
        path: repoPath,
        headers: ghHeaders,
      }),
    ]);

    if (!readmeContent) return [];

    const { title, excerpt } = extractTitleAndExcerpt(readmeContent);
    const detailPath = config.detailPath || config.basePath || "";
    const coverImageUrl = extractCoverImageFromMarkdown(
      readmeContent,
      getRawBaseUrl(config, repoPath)
    );

    return [
      {
        cacheSchemaVersion: CACHE_SCHEMA_VERSION,
        mode: "root-readme",
        showOnHome: false,
        id: `${config.repo}__root`,
        slug: "",
        title: toTitleCase(title || getDisplayName(config)),
        excerpt,
        coverImageUrl,
        link: detailPath,
        detailPath,
        rawUrl: `${getRawBaseUrl(config, repoPath)}README.md`,
        githubUrl: `https://github.com/${config.owner}/${config.repo}`,
        owner: config.owner,
        repo: config.repo,
        branch: config.branch,
        repoPath,
        itemPath: repoPath,
        basePath: config.basePath || detailPath,
        repoDisplayName: getDisplayName(config),
        lastModified,
      },
    ];
  } catch {
    return [];
  }
}

async function fetchRepo(config, ghHeaders) {
  const blogs =
    config.mode === "root-readme"
      ? await fetchRootReadmeRepo(config, ghHeaders)
      : await fetchDirectoryRepo(config, ghHeaders);

  return {
    repoKey: getRepoCacheKey(config),
    blogs,
  };
}

async function fetchAllBlogsFromGithub() {
  const ghHeaders = getGitHubHeaders();
  const repoResults = await Promise.all(
    allRepoConfigs.map((config) => fetchRepo(config, ghHeaders))
  );

  return {
    blogs: repoResults.flatMap((result) => result.blogs),
    repoKeys: repoResults.map((result) => result.repoKey),
  };
}

export function getAllBlogsFromCache() {
  if (allBlogsMemory) return allBlogsMemory;
  return readAllBlogsCache();
}

export async function loadAllBlogs({ forceRefresh = false } = {}) {
  if (!forceRefresh) {
    if (allBlogsMemory) return allBlogsMemory;

    const cachedBlogs = readAllBlogsCache();
    if (cachedBlogs) return cachedBlogs;
  }

  if (allBlogsRequest) return allBlogsRequest;

  allBlogsRequest = fetchAllBlogsFromGithub()
    .then(({ blogs, repoKeys }) => {
      allBlogsMemory = blogs;

      if (blogs.length > 0 && hasRequiredRepoKeys(repoKeys)) {
        setCachedData(
          ALL_BLOGS_CACHE_KEY,
          createCachePayload(blogs, repoKeys)
        );
      }

      return blogs;
    })
    .finally(() => {
      allBlogsRequest = null;
    });

  return allBlogsRequest;
}

export function getBlogsForRepoIndex(allBlogs, repoConfig) {
  return (allBlogs || [])
    .filter((blog) => {
      if (blog.mode === "root-readme") return false;

      const sameRepo =
        blog.owner === repoConfig.owner &&
        blog.repo === repoConfig.repo &&
        (blog.repoPath || "") === (repoConfig.path || "");

      return (
        sameRepo ||
        (repoConfig.basePath &&
          blog.link?.startsWith(`${repoConfig.basePath}/`))
      );
    })
    .map((blog) => ({
      id: blog.slug || blog.id,
      title: blog.title,
      excerpt: blog.excerpt,
      coverImageUrl: blog.coverImageUrl || "",
      rawUrl: blog.rawUrl,
      githubUrl: blog.githubUrl,
      lastModified: blog.lastModified,
    }));
}

export function getBlogsForCombinedIndex(allBlogs, repos) {
  const repoByKey = new Map(
    repos.map((repoConfig) => [getRepoCacheKey(repoConfig), repoConfig])
  );

  return (allBlogs || [])
    .filter((blog) => repoByKey.has(getBlogRepoCacheKey(blog)))
    .map((blog) => {
      const repoConfig = repoByKey.get(getBlogRepoCacheKey(blog));
      const slug = blog.slug || blog.id;
      const detailPath =
        blog.mode === "root-readme"
          ? repoConfig.detailPath || blog.detailPath || blog.link
          : blog.detailPath || `${repoConfig.basePath}/${slug}`;

      return {
        id:
          blog.mode === "root-readme"
            ? `${blog.repo}__root`
            : `${blog.repo}/${slug}`,
        title: blog.title,
        excerpt: blog.excerpt,
        coverImageUrl: blog.coverImageUrl || "",
        rawUrl: blog.rawUrl,
        githubUrl: blog.githubUrl,
        lastModified: blog.lastModified,
        repo: blog.repo,
        repoDisplayName: repoConfig.displayName || blog.repoDisplayName,
        detailPath,
      };
    });
}
