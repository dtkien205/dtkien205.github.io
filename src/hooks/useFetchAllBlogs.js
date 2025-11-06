import { useCallback, useState, useEffect } from "react";
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
import markdownRoutes from "../config/markdownRoutes";

// ================================
// CONSTANTS
// ================================
const CACHE_KEY = "allBlogs_cache_v1";
const CACHE_DURATION = 60 * 60 * 1000; // 1 giờ (tăng từ 10 phút)

/**
 * Custom hook để fetch tất cả blogs từ nhiều GitHub repos
 * Features:
 * - LocalStorage cache (10 phút)
 * - Parallel fetching (tối ưu tốc độ)
 * - Error handling
 */
export function useFetchAllBlogs() {
  // ================================
  // STATE
  // ================================
  const [allBlogs, setAllBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ================================
  // HELPER: Fetch một blog từ directory
  // ================================
  const fetchBlogFromDir = async (d, config, ghHeaders) => {
    const dirPath = config.path ? `${config.path}/${d.name}` : d.name;

    try {
      // Chỉ fetch README content (không fetch commit date để tiết kiệm API calls)
      const readmeContent = await fetchReadmeContent({
        owner: config.owner,
        repo: config.repo,
        branch: config.branch,
        path: dirPath,
      });

      if (!readmeContent) return null;

      const { title, excerpt } = extractTitleAndExcerpt(readmeContent);

      return {
        id: d.name,
        title: toTitleCase(title),
        excerpt,
        link: `${config.basePath || ""}/${d.name}`,
        repoDisplayName: getRepoDisplayName(config.repo),
        lastModified: null, // Không fetch commit date để tiết kiệm API quota
      };
    } catch {
      return null;
    }
  };

  // ================================
  // HELPER: Fetch tất cả blogs từ một repo
  // ================================
  const fetchBlogsFromRepo = async (config, ghHeaders) => {
    try {
      // Lấy danh sách directories từ GitHub API
      const dirs = await fetchDirectories({
        owner: config.owner,
        repo: config.repo,
        path: config.path,
        branch: config.branch,
        headers: ghHeaders,
      });

      // Fetch tất cả blogs song song
      const blogPromises = dirs.map((d) =>
        fetchBlogFromDir(d, config, ghHeaders)
      );
      const blogs = await Promise.all(blogPromises);

      return blogs.filter((b) => b !== null);
    } catch {
      return [];
    }
  };

  // ================================
  // MAIN: Fetch blogs từ tất cả repos
  // ================================
  const fetchBlogs = useCallback(async () => {
    // Bước 1: Kiểm tra cache
    const cachedData = getCachedData(CACHE_KEY, CACHE_DURATION);
    if (cachedData) {
      setAllBlogs(cachedData);
      setLoading(false);
      return;
    }

    // Bước 2: Fetch từ GitHub
    setLoading(true);
    setError("");

    const ghHeaders = getGitHubHeaders();
    const repoConfigs = [
      markdownRoutes.ctfWriteupsRepo,
      markdownRoutes.webVulnsRepo,
      markdownRoutes.webVulnsLabRepo,
    ];

    try {
      // Fetch tất cả repos song song (performance boost)
      const repoPromises = repoConfigs.map((config) =>
        fetchBlogsFromRepo(config, ghHeaders)
      );
      const allResults = await Promise.all(repoPromises);
      const allFetchedBlogs = allResults.flat();

      setAllBlogs(allFetchedBlogs);

      // Bước 3: Lưu vào cache
      setCachedData(CACHE_KEY, allFetchedBlogs);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // ================================
  // EFFECT: Auto-fetch on mount
  // ================================
  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  return { allBlogs, loading, error };
}
