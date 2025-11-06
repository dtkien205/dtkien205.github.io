import { useCallback, useState, useEffect } from "react";
import { toTitleCase } from "../helpers/toTitleCase";
import { extractTitleAndExcerpt } from "../helpers/extractTitleAndExcerpt";
import markdownRoutes from "../config/markdownRoutes";

export function useFetchAllBlogs() {
  const [allBlogs, setAllBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchBlogs = useCallback(async () => {
    // 🚀 Thử load từ cache trước
    const CACHE_KEY = "allBlogs_cache_v1";
    const CACHE_DURATION = 10 * 60 * 1000; // 10 phút

    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_DURATION) {
          setAllBlogs(data);
          setLoading(false);
          return; // Dùng cache, không fetch
        }
      }
    } catch (e) {
      console.warn("Cache read error:", e);
    }

    setLoading(true);
    setError("");

    const ghHeaders = {};
    const token = import.meta.env.VITE_GH_TOKEN;
    if (token) ghHeaders["Authorization"] = `Bearer ${token}`;

    const repoConfigs = [
      markdownRoutes.ctfWriteupsRepo,
      markdownRoutes.webVulnsRepo,
      markdownRoutes.webVulnsLabRepo,
    ];

    try {
      // 🚀 Fetch tất cả repos song song
      const repoPromises = repoConfigs.map(async (config) => {
        try {
          // Lấy danh sách thư mục
          const listUrl = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${config.path}?ref=${config.branch}`;
          const listRes = await fetch(listUrl, { headers: ghHeaders });
          if (!listRes.ok) throw new Error(`HTTP ${listRes.status}`);

          const list = await listRes.json();
          const dirs = list.filter((e) => e.type === "dir");

          // 🚀 Fetch tất cả blogs trong repo song song
          const blogPromises = dirs.map(async (d) => {
            const dirPath = config.path ? `${config.path}/${d.name}` : d.name;

            try {
              // Fetch README và commit song song
              const [readmeRes, commitsRes] = await Promise.all([
                fetch(
                  `https://raw.githubusercontent.com/${config.owner}/${config.repo}/${config.branch}/${dirPath}/README.md`
                ),
                fetch(
                  `https://api.github.com/repos/${config.owner}/${config.repo}/commits?path=${encodeURIComponent(dirPath)}&page=1&per_page=1&ref=${config.branch}`,
                  { headers: ghHeaders }
                ),
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
                link: `${config.basePath || ""}/${d.name}`,
                repoDisplayName: (function () {
                  if (config.repo === "ctf-writeups") return "CTF Writeups";
                  if (config.repo === "webvulns") return "Web Vulns";
                  if (config.repo === "webvulnslab") return "Web Vulns Lab";
                  return toTitleCase(config.repo.replace(/-/g, " "));
                })(),
                lastModified,
              };
            } catch (e) {
              console.warn(`⚠️ Lỗi khi tải ${d.name}:`, e);
              return null;
            }
          });

          const blogs = await Promise.all(blogPromises);
          return blogs.filter((b) => b !== null);
        } catch (e) {
          console.error(`❌ Lỗi khi tải từ ${config.repo}:`, e);
          return [];
        }
      });

      const allResults = await Promise.all(repoPromises);
      const allFetchedBlogs = allResults.flat();

      setAllBlogs(allFetchedBlogs);

      // 💾 Lưu vào cache
      try {
        localStorage.setItem(
          CACHE_KEY,
          JSON.stringify({
            data: allFetchedBlogs,
            timestamp: Date.now(),
          })
        );
      } catch (e) {
        console.warn("Cache write error:", e);
      }
    } catch (e) {
      console.error("❌ Lỗi tổng thể:", e);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  return { allBlogs, loading, error };
}
