// Helper: trích tiêu đề + đoạn trích
// Tối ưu: Thêm memoization để cache kết quả
const cache = new Map();
const MAX_CACHE_SIZE = 100; // Giới hạn cache để tránh memory leak

export function extractTitleAndExcerpt(md) {
  // Check cache
  if (cache.has(md)) {
    return cache.get(md);
  }

  const lines = md.split("\n");
  let title = lines.find((l) => l.trim().startsWith("# ")) || "";
  title = title.replace(/^#\s+/, "").trim();
  const para = lines.find((l) => l.trim() && !l.trim().startsWith("#")) || "";
  const excerpt = para.length > 280 ? para.slice(0, 277) + "…" : para;

  const result = { title: title || "README", excerpt };

  // Lưu cache với size limit
  if (cache.size >= MAX_CACHE_SIZE) {
    const firstKey = cache.keys().next().value;
    cache.delete(firstKey);
  }
  cache.set(md, result);

  return result;
}
