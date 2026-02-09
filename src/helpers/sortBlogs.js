/**
 * Sắp xếp danh sách blogs theo tiêu chí
 * @param {Array} blogs - Danh sách blogs cần sắp xếp
 * @param {string} sortBy - Tiêu chí sắp xếp:
 *   - 'title-asc': Sắp xếp theo tên A-Z
 *   - 'title-desc': Sắp xếp theo tên Z-A
 *   - 'date-asc': Sắp xếp theo ngày cũ nhất
 *   - 'date-desc': Sắp xếp theo ngày mới nhất
 * @returns {Array} - Danh sách blogs đã được sắp xếp
 */
export function sortBlogs(blogs, sortBy) {
    if (!blogs || blogs.length === 0) return blogs;

    const sorted = [...blogs];

    switch (sortBy) {
        case "title-asc":
            return sorted.sort((a, b) => {
                const titleA = (a.title || "").toLowerCase();
                const titleB = (b.title || "").toLowerCase();
                return titleA.localeCompare(titleB);
            });

        case "title-desc":
            return sorted.sort((a, b) => {
                const titleA = (a.title || "").toLowerCase();
                const titleB = (b.title || "").toLowerCase();
                return titleB.localeCompare(titleA);
            });

        case "date-asc":
            return sorted.sort((a, b) => {
                // Blogs không có lastModified sẽ được đưa xuống cuối
                if (!a.lastModified && !b.lastModified) return 0;
                if (!a.lastModified) return 1;
                if (!b.lastModified) return -1;

                const dateA = new Date(a.lastModified);
                const dateB = new Date(b.lastModified);
                return dateA - dateB; // Cũ nhất trước
            });

        case "date-desc":
            return sorted.sort((a, b) => {
                // Blogs không có lastModified sẽ được đưa xuống cuối
                if (!a.lastModified && !b.lastModified) return 0;
                if (!a.lastModified) return 1;
                if (!b.lastModified) return -1;

                const dateA = new Date(a.lastModified);
                const dateB = new Date(b.lastModified);
                return dateB - dateA; // Mới nhất trước
            });

        default:
            return sorted;
    }
}
