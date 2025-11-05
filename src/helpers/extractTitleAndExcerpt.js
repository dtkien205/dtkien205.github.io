// Helper: trích tiêu đề + đoạn trích
export function extractTitleAndExcerpt(md) {
  const lines = md.split("\n");
  let title = lines.find((l) => l.trim().startsWith("# ")) || "";
  title = title.replace(/^#\s+/, "").trim();
  const para = lines.find((l) => l.trim() && !l.trim().startsWith("#")) || "";
  const excerpt = para.length > 280 ? para.slice(0, 277) + "…" : para;
  return { title: title || "README", excerpt };
}
