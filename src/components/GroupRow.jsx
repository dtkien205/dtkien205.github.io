import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import BlogCard from "./BlogCard";
import { humanizeRepoName } from "../helpers/humanizeRepoName";

export default function GroupRow({
  repoDisplayName,
  data,
  isSearching = false,
}) {
  const MAX_SHOW = 4;

  // Tối ưu: dùng JSON.stringify để deep compare hoặc chỉ dùng length
  const sorted = useMemo(() => {
    const s = [...data.blogs];
    s.sort((a, b) => {
      const ta = a.lastModified ? Date.parse(a.lastModified) : 0;
      const tb = b.lastModified ? Date.parse(b.lastModified) : 0;
      return tb - ta;
    });
    return s;
  }, [JSON.stringify(data.blogs.map(b => ({ id: b.id, lastModified: b.lastModified })))]);


  const visible = isSearching ? sorted : sorted.slice(0, MAX_SHOW);

  const showSeeAll =
    !isSearching && !!data.basePath && data.blogs.length >= MAX_SHOW;

  return (
    <div className="mb-16 motion-safe:animate-fade-in-up">
      {/* Section header với gradient underline */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <span className="inline-block w-1.5 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full" />
            {humanizeRepoName(repoDisplayName)}
          </h2>

          {showSeeAll && (
            <Link
              to={data.basePath}
              className="group inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-lg hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
            >
              <span>View all</span>
              <svg
                className="w-4 h-4 transform group-hover:translate-x-1 transition-transform"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  d="M9 5l7 7-7 7"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
          )}
        </div>

        {/* Decorative gradient line */}
        <div className="h-1 bg-gradient-to-r from-blue-200 via-purple-200 to-transparent rounded-full" />
      </div>

      {/* Blog cards grid */}
      <div className="grid items-stretch gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {visible.map((blog, idx) => (
          <div
            key={blog.link}
            className="motion-safe:animate-fade-in-up"
            style={{ animationDelay: `${idx * 50}ms` }}
          >
            <BlogCard blog={blog} />
          </div>
        ))}
      </div>

      {/* Show count if searching */}
      {isSearching && visible.length > 0 && (
        <p className="mt-4 text-sm text-gray-600 flex items-center gap-2">
          <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          Found {visible.length} article{visible.length !== 1 ? 's' : ''} in {humanizeRepoName(repoDisplayName)}
        </p>
      )}
    </div>
  );
}
