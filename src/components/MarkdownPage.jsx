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
import TableOfContents from "../components/TableOfContents";
import ViewCounter from "../components/ViewCounter";
import { stripCoverImageFromMarkdown } from "../helpers/extractCoverImageFromMarkdown";

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
  const renderedContent = React.useMemo(
    () => stripCoverImageFromMarkdown(content),
    [content]
  );

  return (
    <div className="w-full flex min-h-screen bg-gradient-to-br from-blue-50/30 via-white to-purple-50/30 lg:pl-[272px]">
      {/* Table of Contents */}
      {!loading && !error && <TableOfContents content={content} />}

      <section
        className="w-full px-4 md:px-8 lg:px-10 py-8"
        style={{ background: "transparent" }}
      >
        {loading && <PageLoader text="Đang tải nội dung…" />}

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg" role="alert">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-red-800 font-medium">Failed to load content. ({error})</p>
            </div>
          </div>
        )}

        {!loading && !error && (
          <div className="motion-safe:animate-fade-in-up w-full bg-white rounded-none md:rounded-xl shadow-md p-4 md:p-8 border border-gray-100">
            <div className="markdown-body relative" style={{ background: "transparent", maxWidth: "none" }}>
              <div className="absolute top-0 right-2 z-10">
                <ViewCounter />
              </div>

              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[
                  rehypeSlug,
                  [rehypeAutolinkHeadings, { behavior: "append" }],
                ]}
                urlTransform={urlTransform}
              >
                {renderedContent}
              </ReactMarkdown>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
