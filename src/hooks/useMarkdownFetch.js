import { useEffect, useState } from "react";

// In-memory cache: tồn tại suốt session, tránh re-fetch khi navigate qua lại
const markdownCache = new Map();

export function useMarkdownFetch(sourceUrl) {
  const cached = markdownCache.get(sourceUrl);
  const [content, setContent] = useState(cached || "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(!cached);

  useEffect(() => {
    if (markdownCache.has(sourceUrl)) {
      setContent(markdownCache.get(sourceUrl));
      setLoading(false);
      setError("");
      return;
    }

    let active = true;
    setLoading(true);
    setError("");
    fetch(sourceUrl, { cache: "no-store" })
      .then(async (r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const text = await r.text();
        markdownCache.set(sourceUrl, text);
        if (active) setContent(text);
      })
      .catch((e) => active && setError(e.message))
      .finally(() => active && setLoading(false));
    return () => (active = false);
  }, [sourceUrl]);

  return { content, error, loading };
}
