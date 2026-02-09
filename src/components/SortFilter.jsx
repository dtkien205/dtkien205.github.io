import React from "react";

/**
 * Component lọc/sắp xếp blogs
 * @param {string} sortBy - Giá trị sắp xếp hiện tại
 * @param {function} setSortBy - Function để set giá trị sắp xếp
 */
export default function SortFilter({ sortBy, setSortBy }) {
    return (
        <div className="mb-6 flex items-center justify-end gap-3 motion-safe:animate-fade-in-up motion-reduce:animate-none">
            <label htmlFor="sort-select" className="text-sm font-semibold text-gray-700">
                Sort by:
            </label>
            <select
                id="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm text-gray-700 
                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                   hover:border-gray-400 transition-colors cursor-pointer shadow-sm"
            >
                <option value="title-asc">A-Z</option>
                <option value="title-desc">Z-A</option>
                <option value="date-desc">Newest</option>
                <option value="date-asc">Oldest</option>
            </select>
        </div>
    );
}
