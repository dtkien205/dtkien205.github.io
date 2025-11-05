import { useEffect } from "react";
import hljs from "highlight.js/lib/common";
import "highlight.js/styles/github.css";

export function useHighlightCode(content) {
  useEffect(() => {
    if (!content) return;
    const id = requestAnimationFrame(() => {
      document.querySelectorAll("pre code").forEach((el) => {
        try {
          hljs.highlightElement(el);
        } catch {}
      });
    });
    return () => cancelAnimationFrame(id);
  }, [content]);
}
