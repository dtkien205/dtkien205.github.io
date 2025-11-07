/**
 * Format ISO date string sang định dạng tiếng Việt
 * @param {string} iso - ISO date string
 * @returns {string} Formatted date (vd: "6 tháng 11, 2024")
 */
export function formatDate(iso) {
    if (!iso) return "";

    return new Date(iso).toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}
