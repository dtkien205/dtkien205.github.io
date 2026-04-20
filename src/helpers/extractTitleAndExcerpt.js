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

  // Tìm paragraph đầu tiên không phải heading và không phải ảnh
  let para = "";
  for (const line of lines) {
    const trimmed = line.trim();
    // Skip heading, empty line, code fence, và dòng chỉ có ảnh
    if (
      trimmed.startsWith("#") ||
      !trimmed ||
      trimmed.startsWith("```") ||
      /^!\[.*\]\(.*\)\s*$/.test(trimmed) // dòng chỉ có ảnh markdown
    ) {
      continue;
    }
    para = trimmed;
    break;
  }

  // Bỏ ảnh markdown khỏi excerpt
  const excerptClean = para.replace(/!\[.*?\]\(.*?\)/g, "").trim();
  const excerpt = excerptClean.length > 280 ? excerptClean.slice(0, 277) + "…" : excerptClean;

  const result = { title: title || "README", excerpt };

  // Lưu cache với size limit
  if (cache.size >= MAX_CACHE_SIZE) {
    const firstKey = cache.keys().next().value;
    cache.delete(firstKey);
  }
  cache.set(md, result);

  return result;
}
