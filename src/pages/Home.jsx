import React, { useState, useEffect } from "react";
import SearchBar from "../components/SearchBar";
import GroupRow from "../components/GroupRow";
import { useFetchAllBlogs } from "../hooks/useFetchAllBlogs";
import { groupByRepo } from "../helpers/groupByRepo";
import IntroHome from "../components/IntroHome";
import PageLoader from "../components/PageLoader";

export default function Home() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filtered, setFiltered] = useState({});
  const { allBlogs, loading, error } = useFetchAllBlogs();

  useEffect(() => {
    setFiltered(groupByRepo(allBlogs, searchTerm));
  }, [allBlogs, searchTerm]);

  if (loading) return <PageLoader />;
  if (error) {
    return (
      <p className="text-red-600 text-center mt-8" role="alert">
        Lỗi: {error}
      </p>
    );
  }

  const isSearching = !!searchTerm.trim();
  const groups = Object.entries(filtered);

  return (
    // Section vào màn hình: fade-in + slide-up
    <section className="container mx-auto px-4 py-8 motion-safe:animate-fade-in-up">
      <IntroHome />

      <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

      {groups.length > 0 ? (
        groups.map(([name, data], idx) => (
          // Stagger nhẹ mỗi nhóm (không cần sửa GroupRow)
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
