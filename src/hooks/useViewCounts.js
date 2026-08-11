import { useEffect, useState } from "react";

export function useViewCounts(paths) {
  const [viewCounts, setViewCounts] = useState({});

  useEffect(() => {
    const uniquePaths = [...new Set((paths || []).filter(Boolean))];

    if (uniquePaths.length === 0) {
      setViewCounts({});
      return;
    }

    let active = true;

    async function loadViewCounts() {
      try {
        const response = await fetch("/api/views", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ paths: uniquePaths }),
        });

        if (!response.ok) {
          throw new Error("Failed to load view counts");
        }

        const data = await response.json();
        if (active) {
          setViewCounts(data.views || {});
        }
      } catch (error) {
        console.error("View counts error:", error);
      }
    }

    loadViewCounts();

    return () => {
      active = false;
    };
  }, [JSON.stringify(paths || [])]);

  return viewCounts;
}
