import React, { useState, useMemo } from "react";
import SearchBar from "../components/SearchBar";
import GroupRow from "../components/GroupRow";
import { useFetchAllBlogs } from "../hooks/useFetchAllBlogs";
import { groupByRepo } from "../helpers/groupByRepo";
import IntroHome from "../components/IntroHome";
import PageLoader from "../components/PageLoader";

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
