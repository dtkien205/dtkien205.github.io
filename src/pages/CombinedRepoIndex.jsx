import React from "react";
import { Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import IntroPage from "../components/IntroPage";
import SortFilter from "../components/SortFilter";
import { toTitleCase } from "../helpers/toTitleCase";
import { extractTitleAndExcerpt } from "../helpers/extractTitleAndExcerpt";
import { formatDate } from "../helpers/formatDate";
import { sortBlogs } from "../helpers/sortBlogs";
import { getCachedData, setCachedData } from "../helpers/cacheUtils";
import {
    getGitHubHeaders,
    fetchDirectories,
    fetchReadmeContent,
    fetchLastCommitDate,
} from "../helpers/githubApi";
import PageLoader from "../components/PageLoader";

const INITIAL_ITEMS_TO_SHOW = 6;
const CACHE_DURATION = 60 * 60 * 1000;

/**
 * Component hiển thị list items từ 2 repos khác nhau (Attack Lab + Cheat Sheet)
 */
export default function CombinedRepoIndex({ repos, basePath }) {
    const [allBlogs, setAllBlogs] = React.useState([]);
    const [displayedItems, setDisplayedItems] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState("");
    const [page, setPage] = React.useState(1);
    const [hasMore, setHasMore] = React.useState(true);
    const [loadingMore, setLoadingMore] = React.useState(false);
    const [infiniteEnabled, setInfiniteEnabled] = React.useState(false);
    const [sortBy, setSortBy] = React.useState("date-desc");
    const introRepoKey = basePath === "/project" ? "Project" : "Other";
    const showProjectSourceButton = basePath === "/project";

    // Fetch blog từ một directory
    const fetchBlogFromDir = React.useCallback(
        async (d, ghHeaders, repoConfig) => {
            const dirPath = repoConfig.path
                ? `${repoConfig.path}/${d.name}`
                : d.name;

            try {
                const [readmeContent, lastModified] = await Promise.all([
                    fetchReadmeContent({
                        owner: repoConfig.owner,
                        repo: repoConfig.repo,
                        branch: repoConfig.branch,
                        path: dirPath,
                    }),
                    fetchLastCommitDate({
                        owner: repoConfig.owner,
                        repo: repoConfig.repo,
                        branch: repoConfig.branch,
                        path: dirPath,
                        headers: ghHeaders,
                    }),
                ]);

                if (!readmeContent) return null;

                const { title, excerpt } = extractTitleAndExcerpt(readmeContent);

                return {
                    id: `${repoConfig.repo}/${d.name}`,
                    title: toTitleCase(title),
                    excerpt,
                    rawUrl: `https://raw.githubusercontent.com/${repoConfig.owner}/${repoConfig.repo}/${repoConfig.branch}/${dirPath}/README.md`,
                    githubUrl: d.html_url,
                    lastModified,
                    repo: repoConfig.repo,
                    repoDisplayName: repoConfig.displayName,
                    detailPath: `${repoConfig.basePath}/${d.name}`,
                };
            } catch {
                return null;
            }
        },
        []
    );

    const fetchRepoRootReadme = React.useCallback(
        async (ghHeaders, repoConfig) => {
            const rootPath = repoConfig.path || "";

            try {
                const [readmeContent, lastModified] = await Promise.all([
                    fetchReadmeContent({
                        owner: repoConfig.owner,
                        repo: repoConfig.repo,
                        branch: repoConfig.branch,
                        path: rootPath,
                    }),
                    fetchLastCommitDate({
                        owner: repoConfig.owner,
                        repo: repoConfig.repo,
                        branch: repoConfig.branch,
                        path: rootPath,
                        headers: ghHeaders,
                    }),
                ]);

                if (!readmeContent) return null;

                const { title, excerpt } = extractTitleAndExcerpt(readmeContent);

                return {
                    id: `${repoConfig.repo}__root`,
                    title: toTitleCase(title || repoConfig.displayName || repoConfig.repo),
                    excerpt,
                    rawUrl: `https://raw.githubusercontent.com/${repoConfig.owner}/${repoConfig.repo}/${repoConfig.branch}/${rootPath ? `${rootPath}/` : ""}README.md`,
                    githubUrl: `https://github.com/${repoConfig.owner}/${repoConfig.repo}`,
                    lastModified,
                    repo: repoConfig.repo,
                    repoDisplayName: repoConfig.displayName,
                    detailPath: repoConfig.detailPath || repoConfig.basePath,
                };
            } catch {
                return null;
            }
        },
        []
    );

    // Load blogs từ tất cả repos
    React.useEffect(() => {
        let active = true;

        async function loadBlogs() {
            const cacheKey = `combinedRepoIndex_${basePath}_${repos
                .map((r) => `${r.owner}/${r.repo}/${r.mode || "dir"}/${r.path || ""}`)
                .join("|")}_v2`;

            // Check cache
            const cachedData = getCachedData(cacheKey, CACHE_DURATION);
            if (cachedData && active) {
                setAllBlogs(cachedData);
                setDisplayedItems(cachedData.slice(0, INITIAL_ITEMS_TO_SHOW));
                setHasMore(cachedData.length > INITIAL_ITEMS_TO_SHOW);
                setPage(1);
                setInfiniteEnabled(false);
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError("");

                const ghHeaders = getGitHubHeaders();
                const allResults = [];

                // Fetch từ tất cả repos
                for (const repoConfig of repos) {
                    try {
                        if (repoConfig.mode === "root-readme") {
                            const rootItem = await fetchRepoRootReadme(ghHeaders, repoConfig);
                            if (rootItem) allResults.push(rootItem);
                            continue;
                        }

                        const dirs = await fetchDirectories({
                            owner: repoConfig.owner,
                            repo: repoConfig.repo,
                            path: repoConfig.path,
                            branch: repoConfig.branch,
                            headers: ghHeaders,
                        });

                        const blogPromises = dirs.map((d) =>
                            fetchBlogFromDir(d, ghHeaders, repoConfig)
                        );
                        const results = (await Promise.all(blogPromises)).filter(
                            (r) => r !== null
                        );
                        allResults.push(...results);
                    } catch (e) {
                        console.error(`Error fetching from ${repoConfig.repo}:`, e);
                    }
                }

                if (active) {
                    setAllBlogs(allResults);
                    setDisplayedItems(allResults.slice(0, INITIAL_ITEMS_TO_SHOW));
                    setHasMore(allResults.length > INITIAL_ITEMS_TO_SHOW);
                    setPage(1);
                    setInfiniteEnabled(false);

                    // Save to cache
                    setCachedData(cacheKey, allResults);
                }
            } catch (e) {
                if (active) setError(e.message);
            } finally {
                if (active) setLoading(false);
            }
        }

        loadBlogs();
        return () => {
            active = false;
        };
    }, [repos, basePath, fetchBlogFromDir, fetchRepoRootReadme]);

    // Sort blogs
    const sortedBlogs = React.useMemo(() => {
        return sortBlogs(allBlogs, sortBy);
    }, [allBlogs, sortBy]);

    // Update displayed items when sorted blogs change
    React.useEffect(() => {
        if (sortedBlogs.length === 0) return;

        setDisplayedItems(sortedBlogs.slice(0, INITIAL_ITEMS_TO_SHOW));
        setHasMore(sortedBlogs.length > INITIAL_ITEMS_TO_SHOW);
        setPage(1);
        setInfiniteEnabled(false);
    }, [sortedBlogs]);

    // Load more items
    const loadMoreItems = React.useCallback(() => {
        if (loadingMore || !hasMore) return;

        setLoadingMore(true);

        const startIndex = displayedItems.length;
        const endIndex = startIndex + INITIAL_ITEMS_TO_SHOW;
        const newItems = sortedBlogs.slice(startIndex, endIndex);

        if (newItems.length === 0) {
            setHasMore(false);
            setLoadingMore(false);
            return;
        }

        setDisplayedItems((prev) => [...prev, ...newItems]);
        setHasMore(endIndex < sortedBlogs.length);
        setPage((p) => p + 1);
        setLoadingMore(false);
    }, [sortedBlogs, displayedItems.length, hasMore, loadingMore]);

    // Infinite scroll
    React.useEffect(() => {
        if (!infiniteEnabled) return;

        const handleScroll = () => {
            const el = document.documentElement;
            const nearBottom =
                el.scrollTop + el.clientHeight >= el.scrollHeight - 100;
            if (nearBottom && hasMore && !loadingMore && !loading) {
                loadMoreItems();
            }
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, [infiniteEnabled, hasMore, loadingMore, loading, loadMoreItems]);

    const handleLoadMoreClick = () => {
        if (!infiniteEnabled) setInfiniteEnabled(true);
        loadMoreItems();
    };

    // RENDER
    if (loading && allBlogs.length === 0) return <PageLoader />;
    if (error)
        return <p className="text-red-600">Failed to load data: {error}</p>;

    return (
        <section className="container mx-auto px-4 py-8 motion-safe:animate-fade-in-up motion-reduce:animate-none">
            {/* Header section */}
            <div className="mb-12 motion-safe:animate-fade-in-up motion-reduce:animate-none">
                <IntroPage repo={introRepoKey} />
            </div>

            {/* Sort filter */}
            <SortFilter sortBy={sortBy} setSortBy={setSortBy} />

            {/* Blog list */}
            <div className="space-y-6">
                {displayedItems.map((it, idx) => (
                    <article
                        key={it.id}
                        className="group relative bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-blue-200 motion-safe:animate-fade-in-up motion-reduce:animate-none"
                        style={{ animationDelay: `${idx * 50}ms` }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/0 via-purple-50/0 to-pink-50/0 group-hover:from-blue-50/50 group-hover:via-purple-50/30 group-hover:to-pink-50/20 transition-all duration-300 pointer-events-none" />

                        <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />

                        <div className="relative flex flex-col sm:flex-row">
                            <div className="hidden sm:flex sm:w-48 sm:h-auto bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 flex-shrink-0 items-center justify-center">
                                <svg
                                    className="w-20 h-20 text-blue-600"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                >
                                    <rect
                                        x="4"
                                        y="6"
                                        width="12"
                                        height="16"
                                        rx="1"
                                        strokeWidth="1.5"
                                        className="text-blue-400"
                                    />
                                    <rect
                                        x="8"
                                        y="2"
                                        width="12"
                                        height="16"
                                        rx="1"
                                        strokeWidth="2"
                                        fill="currentColor"
                                        className="text-blue-100"
                                    />
                                    <rect
                                        x="8"
                                        y="2"
                                        width="12"
                                        height="16"
                                        rx="1"
                                        strokeWidth="2"
                                        fill="none"
                                    />
                                    <path
                                        d="M16 2v4h4"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                    <line
                                        x1="11"
                                        y1="10"
                                        x2="17"
                                        y2="10"
                                        strokeWidth="1.5"
                                        strokeLinecap="round"
                                    />
                                    <line
                                        x1="11"
                                        y1="13"
                                        x2="17"
                                        y2="13"
                                        strokeWidth="1.5"
                                        strokeLinecap="round"
                                    />
                                    <line
                                        x1="11"
                                        y1="16"
                                        x2="15"
                                        y2="16"
                                        strokeWidth="1.5"
                                        strokeLinecap="round"
                                    />
                                </svg>
                            </div>

                            <div className="flex-1 p-6 flex flex-col">
                                <div className="flex-grow">
                                    <div className="mb-3 flex gap-2">
                                        <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                                            {basePath === "/project"
                                                ? "Project"
                                                : it.repoDisplayName}
                                        </span>
                                    </div>

                                    <Link to={it.detailPath}>
                                        <h2 className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-200 mb-3">
                                            {it.title}
                                        </h2>
                                    </Link>

                                    {it.excerpt && (
                                        <ReactMarkdown
                                            remarkPlugins={[remarkGfm]}
                                            className="text-gray-600 leading-relaxed line-clamp-2 mb-4"
                                        >
                                            {it.excerpt}
                                        </ReactMarkdown>
                                    )}
                                </div>

                                <div className="flex items-center justify-between gap-3 text-sm text-gray-500">
                                    <span>{formatDate(it.lastModified)}</span>

                                    <div className="flex items-center gap-2">
                                        {showProjectSourceButton && it.githubUrl && (
                                            <a
                                                href={it.githubUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                                                </svg>
                                                View Source
                                            </a>
                                        )}

                                        <Link
                                            to={it.detailPath}
                                            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-lg transition-all shadow-md hover:shadow-lg"
                                        >
                                            <span>Read more</span>
                                            <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                            </svg>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </article>
                ))}
            </div>

            {/* Load more button */}
            {hasMore && (
                <div className="flex justify-center mt-12">
                    <button
                        onClick={handleLoadMoreClick}
                        disabled={loadingMore}
                        className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loadingMore ? "Đang tải..." : "Tải thêm"}
                    </button>
                </div>
            )}
        </section>
    );
}
