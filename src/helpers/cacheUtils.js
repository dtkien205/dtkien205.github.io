/**
 * Cache utilities cho LocalStorage
 */

/**
 * Lấy data từ cache nếu còn valid
 * @param {string} key - Cache key
 * @param {number} duration - Cache duration in milliseconds
 * @returns {any|null} Cached data hoặc null nếu expired/invalid
 */
export function getCachedData(key, duration) {
    try {
        const cached = localStorage.getItem(key);
        if (!cached) return null;

        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < duration) {
            return data;
        }
        // Tự động xóa cache expired
        localStorage.removeItem(key);
        return null;
    } catch {
        return null;
    }
}

/**
 * Lưu data vào cache
 * @param {string} key - Cache key
 * @param {any} data - Data cần cache
 * @returns {boolean} True nếu thành công, false nếu thất bại
 */
export function setCachedData(key, data) {
    try {
        localStorage.setItem(
            key,
            JSON.stringify({
                data,
                timestamp: Date.now(),
            })
        );
        return true;
    } catch {
        return false;
    }
}

/**
 * Xóa một cache key cụ thể
 * @param {string} key - Cache key cần xóa
 */
export function clearCache(key) {
    try {
        localStorage.removeItem(key);
        return true;
    } catch {
        return false;
    }
}

/**
 * Xóa tất cả cache liên quan đến blogs
 */
export function clearAllBlogsCache() {
    try {
        const keys = Object.keys(localStorage);
        const blogCacheKeys = keys.filter(
            (key) => key.includes("repoIndex_") || key.includes("allBlogs_")
        );
        blogCacheKeys.forEach((key) => localStorage.removeItem(key));
        return true;
    } catch {
        return false;
    }
}
