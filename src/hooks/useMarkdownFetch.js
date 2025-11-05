import { useEffect, useState } from "react";

export function useMarkdownFetch(sourceUrl) {
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    fetch(sourceUrl, { cache: "no-store" })
      .then(async (r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const text = await r.text();
        if (active) setContent(text);
      })
      .catch((e) => active && setError(e.message))
      .finally(() => active && setLoading(false));
    return () => (active = false);
  }, [sourceUrl]);

  return { content, error, loading };
}
