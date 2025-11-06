import React from "react";
import { Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import IntroPage from "../components/IntroPage";
import { toTitleCase } from "../helpers/toTitleCase";
import { extractTitleAndExcerpt } from "../helpers/extractTitleAndExcerpt";
import { formatDate } from "../helpers/formatDate";
import { getCachedData, setCachedData } from "../helpers/cacheUtils";
import {
  getGitHubHeaders,
  fetchDirectories,
  fetchReadmeContent,
  fetchLastCommitDate,
} from "../helpers/githubApi";
import PageLoader from "../components/PageLoader";

// ================================
// CONSTANTS
// ================================
const INITIAL_ITEMS_TO_SHOW = 6;
const CACHE_DURATION = 60 * 60 * 1000; // 1 giờ (tăng từ 10 phút để giảm API calls)

/**
 * Component hiển thị danh sách blogs từ một GitHub repository
 * Features:
 * - Lazy loading với "Tải thêm"
 * - Infinite scroll (sau khi click "Tải thêm" lần đầu)
 * - LocalStorage cache
 * - Parallel fetching
 */
export default function RepoIndex({
  owner,
  repo,
  branch = "main",
  path = "",
  basePath,
  showExcerpt = true,
}) {
  // ================================
  // STATE
  // ================================
  const [allBlogs, setAllBlogs] = React.useState([]);
  const [displayedItems, setDisplayedItems] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [hasMore, setHasMore] = React.useState(true);
  const [loadingMore, setLoadingMore] = React.useState(false);
  const [infiniteEnabled, setInfiniteEnabled] = React.useState(false);

  // ================================
  // HELPER: Fetch một blog từ directory
  // Tối ưu: Dùng useCallback để memoize function
  // ================================
  const fetchBlogFromDir = React.useCallback(async (d, ghHeaders) => {
    const dirPath = path ? `${path}/${d.name}` : d.name;

    try {
      // Chỉ fetch README content (không fetch commit date để tiết kiệm API quota)
      const readmeContent = await fetchReadmeContent({
        owner,
        repo,
        branch,
        path: dirPath,
      });

      if (!readmeContent) return null;

      const { title, excerpt } = extractTitleAndExcerpt(readmeContent);

      return {
        id: d.name,
        title: toTitleCase(title),
        excerpt,
        rawUrl: `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${dirPath}/README.md`,
        githubUrl: d.html_url,
        lastModified: null, // Không fetch để tiết kiệm API calls
      };
    } catch {
      return null;
    }
  }, [owner, repo, branch, path]);

  // ================================
  // EFFECT: Load danh sách blogs ban đầu
  // ================================
  React.useEffect(() => {
    let active = true;

    async function loadBlogs() {
      const cacheKey = `repoIndex_${owner}_${repo}_${path}_v1`;

      // Bước 1: Kiểm tra cache
      const cachedData = getCachedData(cacheKey, CACHE_DURATION);
      if (cachedData && active) {
        setAllBlogs(cachedData);
        setDisplayedItems(cachedData.slice(0, INITIAL_ITEMS_TO_SHOW));
        setHasMore(cachedData.length > INITIAL_ITEMS_TO_SHOW);
        setPage(1);
        setInfiniteEnabled(false);
        setLoading(false);
        return;
      }

      // Bước 2: Fetch từ GitHub
      try {
        setLoading(true);
        setError("");

        const ghHeaders = getGitHubHeaders();

        // Lấy danh sách directories
        const dirs = await fetchDirectories({
          owner,
          repo,
          path,
          branch,
          headers: ghHeaders,
        });

        // Fetch tất cả blogs song song
        const blogPromises = dirs.map((d) => fetchBlogFromDir(d, ghHeaders));
        const results = (await Promise.all(blogPromises)).filter(
          (r) => r !== null
        );

        if (active) {
          setAllBlogs(results);
          setDisplayedItems(results.slice(0, INITIAL_ITEMS_TO_SHOW));
          setHasMore(results.length > INITIAL_ITEMS_TO_SHOW);
          setPage(1);
          setInfiniteEnabled(false);

          // Bước 3: Lưu vào cache
          setCachedData(cacheKey, results);
        }
      } catch (e) {
        if (active) setError(e.message);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadBlogs();
    return () => {
      active = false;
    };
  }, [owner, repo, branch, path]);

  // ================================
  // FUNCTION: Load thêm items
  // ================================
  const loadMoreItems = React.useCallback(() => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);

    const startIndex = displayedItems.length;
    const endIndex = startIndex + INITIAL_ITEMS_TO_SHOW;
    const newItems = allBlogs.slice(startIndex, endIndex);

    if (newItems.length === 0) {
      setHasMore(false);
      setLoadingMore(false);
      return;
    }

    setDisplayedItems((prev) => [...prev, ...newItems]);
    setHasMore(endIndex < allBlogs.length);
    setPage((p) => p + 1);
    setLoadingMore(false);
  }, [allBlogs, displayedItems.length, hasMore, loadingMore]);

  // ================================
  // EFFECT: Infinite scroll (chỉ khi enabled)
  // ================================
  React.useEffect(() => {
    if (!infiniteEnabled) return;

    const handleScroll = () => {
      const el = document.documentElement;
      const nearBottom =
        el.scrollTop + el.clientHeight >= el.scrollHeight - 100;
      if (nearBottom && hasMore && !loadingMore && !loading) {
        loadMoreItems();
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [infiniteEnabled, hasMore, loadingMore, loading, loadMoreItems]);

  // ================================
  // HANDLER: Click "Tải thêm"
  // ================================
  const handleLoadMoreClick = () => {
    if (!infiniteEnabled) setInfiniteEnabled(true);
    loadMoreItems();
  };

  // ================================
  // RENDER
  // ================================
  if (loading && allBlogs.length === 0) return <PageLoader />;
  if (error)
    return <p className="text-red-600">Failed to load repo: {error}</p>;

  // Kiểm tra xem repo có phải WriteUpCTF không
  const isWriteUpCTF = repo === "WriteUpCTF";
  // Kiểm tra xem có phải WebVulnerabilitiesLab không (cần View Source button)
  const isWebLab = repo === "WebVulnerabilitiesLab";

  return (
    <section className="container mx-auto px-4 py-8 motion-safe:animate-fade-in-up motion-reduce:animate-none">
      {/* Header section với gradient design giống Home */}
      <div className="mb-12 motion-safe:animate-fade-in-up motion-reduce:animate-none">
        <IntroPage repo={repo} />
      </div>

      {/* Blog list với horizontal card design */}
      <div className="space-y-6">
        {displayedItems.map((it, idx) => (
          <article
            key={it.id}
            className="group relative bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-blue-200 motion-safe:animate-fade-in-up motion-reduce:animate-none"
            style={{ animationDelay: `${idx * 50}ms` }}
          >
            {/* Gradient overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/0 via-purple-50/0 to-pink-50/0 group-hover:from-blue-50/50 group-hover:via-purple-50/30 group-hover:to-pink-50/20 transition-all duration-300 pointer-events-none" />

            {/* Top accent bar */}
            <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />

            <div className="relative flex flex-col sm:flex-row">
              {/* Left: Image placeholder with stacked document icon */}
              <div className="w-full sm:w-48 h-48 sm:h-auto bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 flex-shrink-0 flex items-center justify-center">
                <svg className="w-20 h-20 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  {/* Back document */}
                  <rect x="4" y="6" width="12" height="16" rx="1" strokeWidth="1.5" className="text-blue-400" />
                  {/* Front document with details */}
                  <rect x="8" y="2" width="12" height="16" rx="1" strokeWidth="2" fill="currentColor" className="text-blue-100" />
                  <rect x="8" y="2" width="12" height="16" rx="1" strokeWidth="2" fill="none" />
                  {/* Document corner fold */}
                  <path d="M16 2v4h4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  {/* Document lines */}
                  <line x1="11" y1="10" x2="17" y2="10" strokeWidth="1.5" strokeLinecap="round" />
                  <line x1="11" y1="13" x2="17" y2="13" strokeWidth="1.5" strokeLinecap="round" />
                  <line x1="11" y1="16" x2="15" y2="16" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>

              {/* Right: Content */}
              <div className="flex-1 p-6 flex flex-col">
                <div className="flex-grow">
                  {/* Category badge */}
                  <div className="mb-3">
                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                      {repo}
                    </span>
                  </div>

                  <Link to={`${basePath}/${it.id}`}>
                    <h2 className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-200 mb-3">
                      {it.title}
                    </h2>
                  </Link>

                  {/* Excerpt - ẨN nếu là WriteUpCTF */}
                  {showExcerpt && !isWriteUpCTF && it.excerpt && (
                    <div className="text-sm text-gray-600 line-clamp-2 mb-4 prose prose-sm max-w-none">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {it.excerpt}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>

                {/* Footer với buttons */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-4">
                    {it.lastModified && (
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                        </svg>
                        <span className="font-medium">{formatDate(it.lastModified)}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* View Source button - chỉ hiện cho WebVulnerabilitiesLab */}
                    {isWebLab && it.githubUrl && (
                      <a
                        href={it.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                        </svg>
                        View Source
                      </a>
                    )}

                    {/* Read more button */}
                    <Link
                      to={`${basePath}/${it.id}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-lg transition-all shadow-md hover:shadow-lg"
                    >
                      <span>Read more</span>
                      <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Empty state */}
      {displayedItems.length === 0 && !loading && (
        <p className="text-gray-600">
          Không tìm thấy README.md trong các thư mục.
        </p>
      )}

      {/* Load more button */}
      {hasMore && !loading && (
        <div
          className="flex justify-center mt-8 motion-safe:animate-fade-in-up motion-reduce:animate-none"
          style={{ animationDelay: `${displayedItems.length * 60}ms` }}
        >
          <button
            onClick={handleLoadMoreClick}
            disabled={loadingMore}
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {loadingMore ? "Đang tải thêm..." : "Tải thêm"}
          </button>
        </div>
      )}

      {/* Loading indicator */}
      {loadingMore && <p className="text-center mt-4">Đang tải thêm...</p>}
    </section>
  );
}
