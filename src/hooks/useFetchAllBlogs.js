import { useCallback, useEffect, useState } from "react";
import {
  getAllBlogsFromCache,
  loadAllBlogs,
} from "../helpers/allBlogsCache";

export function useFetchAllBlogs() {
  const cachedBlogs = getAllBlogsFromCache();
  const [allBlogs, setAllBlogs] = useState(cachedBlogs || []);
  const [loading, setLoading] = useState(!cachedBlogs);
  const [error, setError] = useState("");

  const fetchBlogs = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const blogs = await loadAllBlogs();
      setAllBlogs(blogs);
    } catch (e) {
      setError(e.message || "Failed to load blogs");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  return { allBlogs, loading, error };
}
