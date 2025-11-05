import React from "react";

export default function SearchBar({ searchTerm, setSearchTerm }) {
  return (
    <div className="bg-gray-100 p-6 rounded-lg shadow-md mb-8">
      <h2 className="text-2xl font-bold mb-4">Tìm kiếm Blog của Kido</h2>
      <div className="relative">
        <input
          type="text"
          placeholder="Tìm kiếm theo tiêu đề hoặc nội dung..."
          className="w-full pl-10 pr-4 py-3 rounded-lg border-2 border-gray-300 focus:outline-none focus:border-blue-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg
            className="h-5 w-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            ></path>
          </svg>
        </div>
      </div>
    </div>
  );
}
