import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import "github-markdown-css";
import { useMarkdownFetch } from "../hooks/useMarkdownFetch";
import { useHighlightCode } from "../hooks/useHighlightCode";
import { useScrollToHash } from "../hooks/useScrollToHash";
import PageLoader from "../components/PageLoader";

export default function MarkdownPage({ sourceUrl }) {
  const { content, error, loading } = useMarkdownFetch(sourceUrl);

  // base URL cho ảnh/link tương đối
  const baseOf = React.useMemo(() => {
    const m = sourceUrl.match(/^(.*\/)(README\.md|readme\.md)$/i);
    return m ? m[1] : sourceUrl.replace(/[^/]+$/, "");
  }, [sourceUrl]);

  useHighlightCode(content);
  useScrollToHash(content);

  const isAbs = (u) =>
    /^[a-z][a-z0-9+.-]*:|^\/\//i.test(u) || u.startsWith("#");
  const urlTransform = (u) => (isAbs(u) ? u : new URL(u, baseOf).toString());

  return (
    <div className="flex justify-center">
      <section
        className="markdown-body w-full max-w-5xl px-4"
        style={{ background: "transparent" }}
      >
        {loading && <PageLoader text="Đang tải nội dung…" />}

        {error && (
          <p className="text-red-600" role="alert">
            Failed to load content. ({error})
          </p>
        )}

        {!loading && !error && (
          <div className="motion-safe:animate-fade-in-up">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[
                rehypeSlug,
                [rehypeAutolinkHeadings, { behavior: "append" }],
              ]}
              urlTransform={urlTransform}
            >
              {content}
            </ReactMarkdown>
          </div>
        )}
      </section>
    </div>
  );
}
