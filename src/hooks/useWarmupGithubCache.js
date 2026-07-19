import { useEffect } from "react";
import { loadAllBlogs } from "../helpers/allBlogsCache";

let hasStartedWarmup = false;

export function useWarmupGithubCache() {
  useEffect(() => {
    if (hasStartedWarmup) return;
    hasStartedWarmup = true;

    loadAllBlogs().catch(() => {
      // Pages that need the data will surface their own load error.
    });
  }, []);
}
