import React from "react";
import { Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import IntroPage from "../components/IntroPage";
import { toTitleCase } from "../helpers/toTitleCase";
import { extractTitleAndExcerpt } from "../helpers/extractTitleAndExcerpt";
import PageLoader from "../components/PageLoader";

const initialItemsToShow = 6; // số item hiển thị ban đầu

const fmtDate = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

export default function RepoIndex({
  owner,
  repo,
  branch = "main",
  path = "",
  basePath,
  showExcerpt = true,
}) {
  const [allBlogs, setAllBlogs] = React.useState([]); // toàn bộ blogs đã fetch
  const [displayedItems, setDisplayedItems] = React.useState([]); // đang hiển thị
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [hasMore, setHasMore] = React.useState(true);
  const [loadingMore, setLoadingMore] = React.useState(false);

  // chỉ bật infinite scroll sau khi user click "Tải thêm"
  const [infiniteEnabled, setInfiniteEnabled] = React.useState(false);

  // Tải danh sách ban đầu
  React.useEffect(() => {
    let active = true;
    async function load() {
      // 🚀 Thử load từ cache trước
      const cacheKey = `repoIndex_${owner}_${repo}_${path}_v1`;
      const CACHE_DURATION = 10 * 60 * 1000; // 10 phút

      try {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < CACHE_DURATION) {
            setAllBlogs(data);
            setDisplayedItems(data.slice(0, initialItemsToShow));
            setHasMore(data.length > initialItemsToShow);
            setPage(1);
            setInfiniteEnabled(false);
            setLoading(false);
            return; // Dùng cache
          }
        }
      } catch (e) {
        console.warn("Cache read error:", e);
      }

      try {
        setLoading(true);
        setError("");

        const listUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`;
        const ghHeaders = {};
        const token = import.meta.env.VITE_GH_TOKEN;
        if (token) ghHeaders["Authorization"] = `Bearer ${token}`;

        // 1) Liệt kê các thư mục con trong path
        const listRes = await fetch(listUrl, { headers: ghHeaders });
        if (!listRes.ok) throw new Error(`List HTTP ${listRes.status}`);
        const list = await listRes.json();
        const dirs = (Array.isArray(list) ? list : []).filter(
          (e) => e.type === "dir",
        );

        // 🚀 2) Fetch tất cả blogs song song thay vì tuần tự
        const blogPromises = dirs.map(async (d) => {
          const dirPath = path ? `${path}/${d.name}` : d.name;

          try {
            // Fetch README và commit song song
            const readmeUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${dirPath}/README.md`;
            const commitsUrl = `https://api.github.com/repos/${owner}/${repo}/commits?path=${encodeURIComponent(
              dirPath,
            )}&page=1&per_page=1&ref=${branch}`;

            const [readmeRes, commitsRes] = await Promise.all([
              fetch(readmeUrl),
              fetch(commitsUrl, { headers: ghHeaders }),
            ]);

            if (!readmeRes.ok) return null;

            const md = await readmeRes.text();
            const { title, excerpt } = extractTitleAndExcerpt(md);

            let lastModified = "";
            if (commitsRes.ok) {
              const commits = await commitsRes.json();
              if (Array.isArray(commits) && commits.length > 0) {
                lastModified = commits[0]?.commit?.author?.date || "";
              }
            }

            return {
              id: d.name,
              title: toTitleCase(title),
              excerpt,
              rawUrl: readmeUrl,
              githubUrl: d.html_url,
              lastModified,
            };
          } catch (e) {
            console.warn(`Could not fetch ${d.name}:`, e);
            return null;
          }
        });

        const results = (await Promise.all(blogPromises)).filter(
          (r) => r !== null,
        );

        if (active) {
          setAllBlogs(results);
          setDisplayedItems(results.slice(0, initialItemsToShow));
          setHasMore(results.length > initialItemsToShow);
          setPage(1);
          setInfiniteEnabled(false);

          // 💾 Lưu vào cache
          try {
            localStorage.setItem(
              cacheKey,
              JSON.stringify({
                data: results,
                timestamp: Date.now(),
              })
            );
          } catch (e) {
            console.warn("Cache write error:", e);
          }
        }
      } catch (e) {
        if (active) setError(e.message);
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [owner, repo, branch, path]);

  // Nạp thêm item (dựa vào số item đang hiển thị để tránh stale state)
  const loadMoreItems = React.useCallback(() => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);

    const startIndex = displayedItems.length;
    const endIndex = startIndex + initialItemsToShow;

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

  // Infinite scroll: CHỈ gắn listener nếu infiniteEnabled === true
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

  // Handler cho nút "Tải thêm": bật cuộn vô hạn sau lần nhấn đầu tiên
  const handleLoadMoreClick = () => {
    if (!infiniteEnabled) setInfiniteEnabled(true);
    loadMoreItems();
  };

  if (loading && allBlogs.length === 0) return <PageLoader />;
  if (error) return <p className="text-red-600">Failed to load repo: {error}</p>;

  return (
    <section className="container mx-auto px-4 py-8 motion-safe:animate-fade-in-up motion-reduce:animate-none">
      {/* Phần mở đầu (có thể thêm animate riêng nếu muốn) */}
      <div className="motion-safe:animate-fade-in-up motion-reduce:animate-none">
        <IntroPage repo={repo} />
      </div>

      {/* Danh sách bài viết — stagger từng item */}
      {displayedItems.map((it, idx) => (
        <article
          key={it.id}
          className="py-8 pb-2 border-b motion-safe:animate-fade-in-up motion-reduce:animate-none"
          style={{ animationDelay: `${idx * 60}ms` }}
        >
          <div className="flex flex-col">
            <Link to={`${basePath}/${it.id}`} className="block">
              <h2 className="text-2xl font-bold hover:underline">{it.title}</h2>
            </Link>

            {showExcerpt && (
              <div className="mt-3 text-gray-700 markdown-body">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {it.excerpt}
                </ReactMarkdown>
              </div>
            )}

            {it.lastModified && (
              <div className="mt-4 text-sm text-gray-500 ml-auto text-right">
                Last updated: {fmtDate(it.lastModified)}
              </div>
            )}
          </div>
        </article>
      ))}

      {displayedItems.length === 0 && !loading && (
        <p className="text-gray-600">
          Không tìm thấy README.md trong các thư mục.
        </p>
      )}

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

      {loadingMore && <p className="text-center mt-4">Đang tải thêm...</p>}
    </section>
  );
}
