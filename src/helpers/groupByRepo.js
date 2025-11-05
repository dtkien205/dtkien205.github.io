export function groupByRepo(blogs, searchTerm = "") {
  const q = (searchTerm || "").trim().toLowerCase();

  // Nếu không có từ khóa -> không lọc
  const filtered = q
    ? blogs.filter((b) => {
        const title = (b.title || "").toLowerCase();
        const excerpt = (b.excerpt || "").toLowerCase();
        return title.includes(q) || excerpt.includes(q);
      })
    : blogs;

  return filtered.reduce((acc, blog) => {
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
}
