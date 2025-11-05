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

  const sorted = useMemo(() => {
    const s = [...data.blogs];
    s.sort((a, b) => {
      const ta = a.lastModified ? Date.parse(a.lastModified) : 0;
      const tb = b.lastModified ? Date.parse(b.lastModified) : 0;
      return tb - ta;
    });
    return s;
  }, [data.blogs]);

  const visible = isSearching ? sorted : sorted.slice(0, MAX_SHOW);

  const showSeeAll =
    !isSearching && !!data.basePath && data.blogs.length >= MAX_SHOW;

  return (
    <div className="mb-12 motion-safe:animate-fade-in-up">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-800">
          {humanizeRepoName(repoDisplayName)}
        </h2>

        {showSeeAll && (
          <Link
            to={data.basePath}
            className="inline-flex items-center gap-1 text-black-600 hover:underline"
          >
            Xem tất cả
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M9 5l7 7-7 7"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        )}
      </div>

      <div className="grid items-stretch gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {visible.map((blog) => (
          <BlogCard key={blog.link} blog={blog} />
        ))}
      </div>
    </div>
  );
}
