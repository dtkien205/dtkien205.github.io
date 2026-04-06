import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import SearchBar from "../components/SearchBar";
import GroupRow from "../components/GroupRow";
import { useFetchAllBlogs } from "../hooks/useFetchAllBlogs";
import { groupByRepo } from "../helpers/groupByRepo";
import IntroHome from "../components/IntroHome";
import PageLoader from "../components/PageLoader";

const HOME_CATEGORY_LINKS = [
  {
    title: "Project",
    description:
      "Projects I’ve worked on while learning and experimenting.",
    to: "/project",
  },
  {
    title: "Other",
    description:
      "Security labs and cheat sheets for attack techniques, exploit development, and quick references.",
    to: "/other",
  },
];

export default function Home() {
  // ================================
  // STATE
  // ================================
  const [searchTerm, setSearchTerm] = useState("");
  const { allBlogs, loading, error } = useFetchAllBlogs();

  // ================================
  // OPTIMIZATION: Dùng useMemo thay vì useEffect để filter
  // ================================
  const filtered = useMemo(() => {
    return groupByRepo(allBlogs, searchTerm);
  }, [allBlogs, searchTerm]);

  // ================================
  // RENDER: Loading state
  // ================================
  if (loading) return <PageLoader />;

  // ================================
  // RENDER: Error state
  // ================================
  if (error) {
    return (
      <p className="text-red-600 text-center mt-8" role="alert">
        Lỗi: {error}
      </p>
    );
  }

  // ================================
  // RENDER: Main content
  // ================================
  const isSearching = !!searchTerm.trim();
  const groups = Object.entries(filtered);

  return (
    <section className="container mx-auto px-4 py-8 motion-safe:animate-fade-in-up">
      {/* Intro section */}
      <IntroHome />

      {/* Search bar */}
      <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

      {/* Quick category links */}
      <div className="mb-12 grid gap-4 grid-cols-1 md:grid-cols-2">
        {HOME_CATEGORY_LINKS.map((item) => (
          <Link
            key={item.title}
            to={item.to}
            className="group relative flex h-full overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
          >
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-blue-50/0 via-purple-50/0 to-pink-50/0 transition-all duration-300 group-hover:from-blue-50/70 group-hover:via-purple-50/40 group-hover:to-pink-50/30" />
            <div className="relative flex h-full flex-1 flex-col">
              <h3 className="mb-2 text-2xl font-bold text-gray-900 group-hover:text-blue-700 transition-colors">
                {item.title}
              </h3>
              <p className="mb-6 text-sm leading-relaxed text-gray-600">
                {item.description}
              </p>
              <span className="mt-auto inline-flex w-fit items-center gap-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-2 text-xs font-semibold text-white shadow-md transition-all group-hover:from-blue-600 group-hover:to-purple-700">
                Explore {item.title}
                <svg
                  className="h-4 w-4 transition-transform group-hover:translate-x-1"
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
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* Blog groups với stagger animation */}
      {groups.length > 0 ? (
        groups.map(([name, data], idx) => (
          <div
            key={name}
            className="motion-safe:animate-fade-in-up"
            style={{ animationDelay: `${idx * 60}ms` }}
          >
            <GroupRow
              repoDisplayName={name}
              data={data}
              isSearching={isSearching}
            />
          </div>
        ))
      ) : (
        <p className="text-gray-600 text-center">
          Không tìm thấy blog nào phù hợp với tìm kiếm của bạn.
        </p>
      )}
    </section>
  );
}
