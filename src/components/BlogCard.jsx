import React from "react";
import { Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";

// Memoize component để tránh re-render không cần thiết
const BlogCard = React.memo(({ blog }) => {
  const displayDate = blog.lastModified
    ? new Date(blog.lastModified).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
    : null;

  // Kiểm tra xem có phải WriteUpCTF không
  const isWriteUpCTF = blog.repoDisplayName === "WriteUpCTF";

  return (
    <div className="group relative bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden h-full border border-gray-100 hover:border-blue-200">
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/0 via-purple-50/0 to-pink-50/0 group-hover:from-blue-50/50 group-hover:via-purple-50/30 group-hover:to-pink-50/20 transition-all duration-300 pointer-events-none" />

      <Link to={blog.link} className="relative h-full flex flex-col">
        {/* Top accent bar */}
        <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />

        <div className="p-5 flex-grow relative">
          {/* Category badge (optional - can extract from repo name) */}
          <div className="mb-3">
            <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
              {blog.repoDisplayName || "Article"}
            </span>
          </div>

          <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-200 line-clamp-2 mb-3">
            {blog.title}
          </h3>

          {/* Excerpt nếu có và KHÔNG phải WriteUpCTF */}
          {blog.excerpt && !isWriteUpCTF && (
            <div className="text-sm text-gray-600 line-clamp-3 mb-4 prose prose-sm max-w-none">
              <ReactMarkdown>{blog.excerpt}</ReactMarkdown>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 pb-5 flex items-center justify-between text-xs text-gray-500 mt-auto border-t border-gray-100 pt-4">
          {displayDate && (
            <div className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">{displayDate}</span>
            </div>
          )}

          {/* Read more arrow */}
          <div className="flex items-center gap-1 text-blue-600 font-semibold group-hover:gap-2 transition-all">
            <span className="text-xs">Read more</span>
            <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </Link>
    </div>
  );
});

BlogCard.displayName = "BlogCard";

export default BlogCard;
