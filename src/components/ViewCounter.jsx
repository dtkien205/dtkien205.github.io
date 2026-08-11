import React, { useEffect, useState } from "react";

export default function ViewCounter({
  path,
  increment = true,
  className = "",
}) {
  const [views, setViews] = useState(null);

  useEffect(() => {
    const loadViews = async () => {
      try {
        const targetPath = path || window.location.pathname;
        const endpoint = increment
          ? "/api/views"
          : `/api/views?path=${encodeURIComponent(targetPath)}`;

        const response = await fetch(
          endpoint,
          increment
            ? {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  path: targetPath,
                }),
              }
            : undefined
        );

        if (!response.ok) {
          throw new Error("Failed to load views");
        }

        const data = await response.json();
        setViews(Number(data.views || 0));
      } catch (error) {
        console.error("View counter error:", error);
        setViews(0);
      }
    };

    loadViews();
  }, [path, increment]);

  return (
    <div
      className={`flex items-center gap-1.5 text-gray-500 text-sm font-medium select-none ${className}`}
      title="Views"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="w-5 h-5"
        aria-hidden="true"
      >
        <path d="M2.062 12.348a1 1 0 0 1 0-.696C3.423 7.51 7.36 5 12 5c4.638 0 8.573 2.508 9.936 6.648a1 1 0 0 1 0 .696C20.577 16.49 16.64 19 12 19c-4.638 0-8.573-2.508-9.938-6.652Z" />
        <circle cx="12" cy="12" r="3" />
      </svg>

      <span>{views === null ? "..." : views.toLocaleString()}</span>
    </div>
  );
}
