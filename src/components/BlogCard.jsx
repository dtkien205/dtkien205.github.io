import React from "react";
import { Link } from "react-router-dom";

export default function BlogCard({ blog }) {
  const displayDate = blog.lastModified
    ? new Date(blog.lastModified).toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 h-full">
      <Link to={blog.link} className=" h-full flex flex-col">
        <div className="p-4 pt-2 flex-grow">
          <h3 className="text-xl font-semibold text-gray-900 hover:text-blue-600">
            {blog.title}
          </h3>
        </div>

        <div className="p-4 flex items-center justify-between text-xs text-gray-500 mt-auto">
          {displayDate && <span>Last updated: {displayDate}</span>}
        </div>
      </Link>
    </div>
  );
}
