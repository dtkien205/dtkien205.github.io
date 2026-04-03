import { useEffect } from "react";
import markdownRoutes from "../config/markdownRoutes";
import { toTitleCase } from "../helpers/toTitleCase";
import { extractTitleAndExcerpt } from "../helpers/extractTitleAndExcerpt";
import { getRepoDisplayName } from "../helpers/getRepoDisplayName";
import { getCachedData, setCachedData } from "../helpers/cacheUtils";
import {
  getGitHubHeaders,
  fetchDirectories,
  fetchReadmeContent,
  fetchLastCommitDate,
} from "../helpers/githubApi";

const CACHE_DURATION = 60 * 60 * 1000;
const ALL_BLOGS_CACHE_KEY = "allBlogs_cache_v1";

let hasStartedWarmup = false;

function getRepoConfigs() {
  return [
    markdownRoutes.ctfWriteupsRepo,
    markdownRoutes.webVulnsRepo,
    markdownRoutes.webVulnsLabRepo,
    markdownRoutes.attackLabRepo,
    markdownRoutes.cheatSheetRepo,
  ];
}

function getRepoIndexCacheKey(config) {
  return `repoIndex_${config.owner}_${config.repo}_${config.path}_v1`;
}

function toHomeBlogItem(repoBlog, config) {
  return {
    id: repoBlog.id,
    title: repoBlog.title,
    excerpt: repoBlog.excerpt,
    link: `${config.basePath || ""}/${repoBlog.id}`,
    repoDisplayName: getRepoDisplayName(config.repo),
    lastModified: repoBlog.lastModified || null,
  };
}

async function fetchRepoBlogs(config, ghHeaders) {
  const dirs = await fetchDirectories({
    owner: config.owner,
    repo: config.repo,
    path: config.path,
    branch: config.branch,
    headers: ghHeaders,
  });

  const blogPromises = dirs.map(async (d) => {
    const dirPath = config.path ? `${config.path}/${d.name}` : d.name;

    try {
      const [readmeContent, lastModified] = await Promise.all([
        fetchReadmeContent({
          owner: config.owner,
          repo: config.repo,
          branch: config.branch,
          path: dirPath,
        }),
        fetchLastCommitDate({
          owner: config.owner,
          repo: config.repo,
          branch: config.branch,
          path: dirPath,
          headers: ghHeaders,
        }),
      ]);

      if (!readmeContent) return null;

      const { title, excerpt } = extractTitleAndExcerpt(readmeContent);

      return {
        id: d.name,
        title: toTitleCase(title),
        excerpt,
        rawUrl: `https://raw.githubusercontent.com/${config.owner}/${config.repo}/${config.branch}/${dirPath}/README.md`,
        githubUrl: d.html_url,
        lastModified,
      };
    } catch {
      return null;
    }
  });

  const results = await Promise.all(blogPromises);
  return results.filter((item) => item !== null);
}

export function useWarmupGithubCache() {
  useEffect(() => {
    if (hasStartedWarmup) return;
    hasStartedWarmup = true;

    let active = true;

    const warmup = async () => {
      const ghHeaders = getGitHubHeaders();
      const repoConfigs = getRepoConfigs();
      const repoResults = await Promise.all(
        repoConfigs.map(async (config) => {
          const cacheKey = getRepoIndexCacheKey(config);

          try {
            const repoBlogs = await fetchRepoBlogs(config, ghHeaders);
            if (repoBlogs.length > 0) {
              // Luôn refresh cache khi app vào lần đầu
              setCachedData(cacheKey, repoBlogs);
              return { config, blogs: repoBlogs };
            }
          } catch {
            // Bỏ qua để fallback cache cũ bên dưới
          }

          const cachedRepoBlogs = getCachedData(cacheKey, CACHE_DURATION);
          return {
            config,
            blogs: Array.isArray(cachedRepoBlogs) ? cachedRepoBlogs : [],
          };
        })
      );

      if (!active) return;

      const allBlogsAggregate = repoResults.flatMap(({ config, blogs }) =>
        blogs.map((item) => toHomeBlogItem(item, config))
      );

      if (!active) return;

      if (allBlogsAggregate.length > 0) {
        // Luôn refresh cache Home sau khi warmup xong
        setCachedData(ALL_BLOGS_CACHE_KEY, allBlogsAggregate);
      }
    };

    warmup();

    return () => {
      active = false;
    };
  }, []);
}
