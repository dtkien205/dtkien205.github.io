import React, { useCallback, useState, useRef, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";

const MAX_SUGGESTIONS = 10;

export default function SearchBar({ searchTerm, setSearchTerm, totalResults = null, allBlogs = [] }) {
  const [isFocused, setIsFocused] = useState(false);
  const [highlightedIdx, setHighlightedIdx] = useState(-1);
  const inputRef = useRef(null);
  const wrapperRef = useRef(null);   // outermost div — dropdown is positioned relative to this
  const navigate = useNavigate();

  const handleChange = useCallback((e) => {
    setSearchTerm(e.target.value);
    setHighlightedIdx(-1);
  }, [setSearchTerm]);

  const handleClear = useCallback(() => {
    setSearchTerm("");
    setHighlightedIdx(-1);
    inputRef.current?.focus();
  }, [setSearchTerm]);

  // Filter suggestions from allBlogs
  const suggestions = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q || allBlogs.length === 0) return [];
    return allBlogs
      .filter((b) => (b.title || "").toLowerCase().includes(q))
      .slice(0, MAX_SUGGESTIONS);
  }, [searchTerm, allBlogs]);

  const showDropdown = isFocused && searchTerm.trim().length > 0 && suggestions.length > 0;

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectSuggestion = useCallback((blog) => {
    setIsFocused(false);
    setSearchTerm(blog.title || "");
    navigate(blog.link || blog.detailPath || "/");
  }, [navigate, setSearchTerm]);

  const handleKeyDown = useCallback((e) => {
    if (!showDropdown) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIdx((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIdx((i) => Math.max(i - 1, -1));
    } else if (e.key === "Enter" && highlightedIdx >= 0) {
      e.preventDefault();
      handleSelectSuggestion(suggestions[highlightedIdx]);
    } else if (e.key === "Escape") {
      setIsFocused(false);
    }
  }, [showDropdown, suggestions, highlightedIdx, handleSelectSuggestion]);

  // Highlight: typed part → normal weight, rest → bold (Google style)
  const renderTitle = useCallback((title) => {
    const q = searchTerm.trim().toLowerCase();
    const idx = title.toLowerCase().indexOf(q);
    if (idx === -1) return <span className="font-bold">{title}</span>;
    const before = title.slice(0, idx);
    const match = title.slice(idx, idx + q.length);
    const after = title.slice(idx + q.length);
    return (
      <>
        <span className="font-bold">{before}</span>
        <span className="font-normal">{match}</span>
        <span className="font-bold">{after}</span>
      </>
    );
  }, [searchTerm]);

  return (
    // wrapperRef = positioning context for the floating dropdown
    <div className="relative mb-12" ref={wrapperRef}>

      {/* ── Glassmorphism card ── */}
      <div className="backdrop-blur-sm bg-gradient-to-r from-blue-50/80 to-purple-50/80 p-8 rounded-2xl shadow-lg border border-white/20">
        {/* Header */}
        <div className="flex items-center gap-4 mb-4">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg">
            <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Search Articles
          </h2>
        </div>

        {/* Input row — no dropdown inside here */}
        <div className="relative group">
          <input
            ref={inputRef}
            type="text"
            placeholder="Search by title, content, or tags..."
            className="w-full pl-12 pr-10 py-4 rounded-xl border-2 border-gray-200
                     focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100
                     bg-white/90 backdrop-blur-sm
                     transition-all duration-300
                     placeholder:text-gray-400 text-gray-800 font-medium
                     shadow-sm hover:shadow-md"
            value={searchTerm}
            onChange={handleChange}
            onFocus={() => setIsFocused(true)}
            onKeyDown={handleKeyDown}
            autoComplete="off"
          />

          {/* Search icon */}
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Clear button */}
          {searchTerm && (
            <button
              onClick={handleClear}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </button>
          )}
        </div>

        {/* Result count */}
        {searchTerm && (
          <p className={`mt-3 text-sm flex items-center gap-2 ${
            totalResults === 0 ? "text-red-500"
            : totalResults !== null ? "text-green-600"
            : "text-gray-600"
          }`}>
            {totalResults === null ? (
              <>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                Searching for &ldquo;{searchTerm}&rdquo;
              </>
            ) : totalResults === 0 ? (
              <>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                No results found for &ldquo;{searchTerm}&rdquo;
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Found <strong className="mx-1">{totalResults}</strong>{" "}
                {totalResults === 1 ? "article" : "articles"} for &ldquo;{searchTerm}&rdquo;
              </>
            )}
          </p>
        )}
      </div>

      {/* ── Dropdown: OUTSIDE the card, absolute to wrapperRef ── */}
      {showDropdown && (
        <ul
          className="absolute left-8 right-8 z-50 bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden"
          style={{ top: "calc(100% - 0.75rem)" }}
          role="listbox"
        >
          {suggestions.map((blog, idx) => (
            <li
              key={blog.link || blog.id || idx}
              role="option"
              aria-selected={idx === highlightedIdx}
              onMouseDown={(e) => {
                e.preventDefault();
                handleSelectSuggestion(blog);
              }}
              onMouseEnter={() => setHighlightedIdx(idx)}
              className={`flex items-center gap-3 px-5 py-3 cursor-pointer text-sm text-gray-700 transition-colors
                ${idx === highlightedIdx ? "bg-gray-100" : "hover:bg-gray-50"}
                ${idx !== 0 ? "border-t border-gray-100" : ""}`}
            >
              <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="truncate">{renderTitle(blog.title || "")}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
