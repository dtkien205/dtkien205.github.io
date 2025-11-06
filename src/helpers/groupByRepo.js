// Tối ưu: Cache kết quả để tránh filter/reduce lại
const cache = new Map();
const MAX_CACHE_SIZE = 50;

export function groupByRepo(blogs, searchTerm = "") {
  const q = (searchTerm || "").trim().toLowerCase();

  // Tạo cache key từ blogs length và search term
  const cacheKey = `${blogs.length}_${q}`;

  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  // Nếu không có từ khóa -> không lọc
  const filtered = q
    ? blogs.filter((b) => {
      const title = (b.title || "").toLowerCase();
      const excerpt = (b.excerpt || "").toLowerCase();
      return title.includes(q) || excerpt.includes(q);
    })
    : blogs;

  const result = filtered.reduce((acc, blog) => {
    const key = blog.repoDisplayName;

    if (!acc[key]) {
      // Suy ra basePath từ link đầu tiên của nhóm
      const link = blog.link || "";
      const i = link.lastIndexOf("/");
      const basePath = i > 0 ? link.slice(0, i) : "";
      acc[key] = { basePath, blogs: [] };
    }

    acc[key].blogs.push(blog);
    return acc;
  }, {});

  // Lưu cache với size limit
  if (cache.size >= MAX_CACHE_SIZE) {
    const firstKey = cache.keys().next().value;
    cache.delete(firstKey);
  }
  cache.set(cacheKey, result);

  return result;
}
