import React, { useCallback } from "react";

export default function SearchBar({ searchTerm, setSearchTerm }) {
  // Tối ưu: Memoize handler để tránh re-render child components
  const handleChange = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, [setSearchTerm]);

  const handleClear = useCallback(() => {
    setSearchTerm("");
  }, [setSearchTerm]);

  return (
    <div className="relative mb-12">
      {/* Glassmorphism effect */}
      <div className="backdrop-blur-sm bg-gradient-to-r from-blue-50/80 to-purple-50/80 p-8 rounded-2xl shadow-lg border border-white/20">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg">
            <svg
              className="h-6 w-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Search Articles
          </h2>
        </div>

        <div className="relative group">
          <input
            type="text"
            placeholder="Search by title, content, or tags..."
            className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-gray-200 
                     focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100
                     bg-white/90 backdrop-blur-sm
                     transition-all duration-300
                     placeholder:text-gray-400
                     text-gray-800 font-medium
                     shadow-sm hover:shadow-md"
            value={searchTerm}
            onChange={handleChange}
          />

          {/* Search icon inside input */}
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg
              className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          {/* Clear button */}
          {searchTerm && (
            <button
              onClick={handleClear}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          )}
        </div>

        {/* Search results count */}
        {searchTerm && (
          <p className="mt-3 text-sm text-gray-600 flex items-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            Searching for "{searchTerm}"
          </p>
        )}
      </div>
    </div>
  );
}
