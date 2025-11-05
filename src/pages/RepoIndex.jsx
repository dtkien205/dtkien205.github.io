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

        // 2) Với mỗi thư mục: fetch README (raw) + commit gần nhất (API)
        const results = [];
        for (const d of dirs) {
          const dirPath = path ? `${path}/${d.name}` : d.name;

          // README (raw) — KHÔNG gửi header để tránh CORS
          const readmeUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${dirPath}/README.md`;
          const r = await fetch(readmeUrl);
          if (!r.ok) continue;
          const md = await r.text();
          const { title, excerpt } = extractTitleAndExcerpt(md);

          // lấy Last updated
          let lastModified = "";
          try {
            const commitsUrl = `https://api.github.com/repos/${owner}/${repo}/commits?path=${encodeURIComponent(
              dirPath,
            )}&page=1&per_page=1&ref=${branch}`;
            const cRes = await fetch(commitsUrl, { headers: ghHeaders });
            if (cRes.ok) {
              const commits = await cRes.json();
              if (Array.isArray(commits) && commits.length > 0) {
                lastModified = commits[0]?.commit?.author?.date || "";
              }
            } else {
              console.warn(
                `Failed to fetch commits for ${dirPath}: HTTP ${cRes.status}`,
              );
            }
          } catch (e) {
            console.warn(`Could not fetch commit info for ${dirPath}:`, e);
          }

          results.push({
            id: d.name,
            title: toTitleCase(title),
            excerpt,
            rawUrl: readmeUrl,
            githubUrl: d.html_url,
            lastModified, // dùng để hiển thị Last updated
          });
        }

        if (active) {
          setAllBlogs(results);
          setDisplayedItems(results.slice(0, initialItemsToShow));
          setHasMore(results.length > initialItemsToShow);
          setPage(1);
          setInfiniteEnabled(false); // reset: chưa bật cuộn vô hạn
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
  if (error)
    return <p className="text-red-600">Failed to load repo: {error}</p>;

  return (
    <section className="pb-8">
      {/* Phần mở đầu cố định tuỳ theo repo */}
      <IntroPage repo={repo} />

      {/* Danh sách bài viết */}
      {displayedItems.map((it) => (
        <article key={it.id} className="py-8 pb-2 border-b">
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

            {/* Đưa Last updated xuống đáy block */}
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

      {/* Nút “Tải thêm” — bật cuộn vô hạn sau lần click đầu */}
      {hasMore && !loading && (
        <div className="flex justify-center mt-8">
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
