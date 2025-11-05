import { useCallback, useState, useEffect } from "react";
import { toTitleCase } from "../helpers/toTitleCase";
import { extractTitleAndExcerpt } from "../helpers/extractTitleAndExcerpt";
import markdownRoutes from "../config/markdownRoutes";

export function useFetchAllBlogs() {
  const [allBlogs, setAllBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchBlogs = useCallback(async () => {
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

    const allFetchedBlogs = [];

    for (const config of repoConfigs) {
      try {
        // 🔹 Lấy danh sách thư mục con trong repo
        const listUrl = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${config.path}?ref=${config.branch}`;
        const listRes = await fetch(listUrl, { headers: ghHeaders });
        if (!listRes.ok)
          throw new Error(`Không thể tải danh sách: HTTP ${listRes.status}`);

        const list = await listRes.json();
        const dirs = list.filter((e) => e.type === "dir");

        for (const d of dirs) {
          const dirPath = config.path ? `${config.path}/${d.name}` : d.name;

          // 🔹 Lấy commit gần nhất cho thư mục (để hiển thị Last updated)
          let lastModified = "";
          try {
            const commitsUrl = `https://api.github.com/repos/${config.owner}/${config.repo}/commits?path=${encodeURIComponent(
              dirPath,
            )}&page=1&per_page=1&ref=${config.branch}`;

            const commitsRes = await fetch(commitsUrl, { headers: ghHeaders });
            if (commitsRes.ok) {
              const commits = await commitsRes.json();
              if (Array.isArray(commits) && commits.length > 0) {
                lastModified = commits[0]?.commit?.author?.date || "";
              }
            } else {
              console.warn(
                `⚠️ Không thể lấy commit cho ${dirPath}: HTTP ${commitsRes.status}`,
              );
            }
          } catch (e) {
            console.warn(`⚠️ Lỗi khi lấy commit info cho ${dirPath}:`, e);
          }

          // 🔹 Lấy README.md trong thư mục
          const readmeUrl = `https://raw.githubusercontent.com/${config.owner}/${config.repo}/${config.branch}/${dirPath}/README.md`;
          const r = await fetch(readmeUrl);
          if (!r.ok) {
            console.warn(
              `⚠️ Không thể tải README của ${d.name} trong ${config.repo}`,
            );
            continue;
          }

          const md = await r.text();
          const { title, excerpt } = extractTitleAndExcerpt(md);

          // 🔹 Đưa vào danh sách
          allFetchedBlogs.push({
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
            lastModified, // ✅ thêm lại thời gian cập nhật cuối
          });
        }
      } catch (e) {
        console.error(`❌ Lỗi khi tải từ ${config.repo}:`, e);
        setError((prev) =>
          prev ? `${prev}; ${e.message}` : `Error: ${e.message}`,
        );
      }
    }

    // 🔹 Cập nhật state
    setAllBlogs(allFetchedBlogs);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  return { allBlogs, loading, error };
}
