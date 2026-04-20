import React, { useState, useEffect, useRef, useCallback } from "react";

export default function TableOfContents({ content }) {
    const [headings, setHeadings] = useState([]);
    const [activeId, setActiveId] = useState("");
    const [hoveredId, setHoveredId] = useState(null);
    const [isFooterVisible, setIsFooterVisible] = useState(false);
    const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });
    const itemsRef = useRef({});
    const navRef = useRef(null);

    const collectHeadings = useCallback(() => {
        const articleContent = document.querySelector(".markdown-body");
        if (!articleContent) {
            setHeadings([]);
            return;
        }

        const headingElements = articleContent.querySelectorAll("h2, h3, h4, h5, h6");
        const headingList = Array.from(headingElements).map((heading) => {
            // Ensure heading has an ID for linking
            if (!heading.id) {
                heading.id = heading.textContent
                    .toLowerCase()
                    .replace(/[^\w\s-]/g, "")
                    .replace(/\s+/g, "-");
            }

            return {
                id: heading.id,
                text: heading.textContent,
                level: parseInt(heading.tagName[1], 10),
            };
        });

        setHeadings(headingList);
    }, []);

    useEffect(() => {
        // Recollect after markdown content updates and DOM has rendered.
        let raf2 = 0;
        const raf1 = requestAnimationFrame(() => {
            raf2 = requestAnimationFrame(() => {
                collectHeadings();
            });
        });

        return () => {
            cancelAnimationFrame(raf1);
            if (raf2) cancelAnimationFrame(raf2);
        };
    }, [content, collectHeadings]);

    // Track active heading based on scroll
    useEffect(() => {
        const handleScroll = () => {
            const headingElements = document.querySelectorAll(".markdown-body h2, .markdown-body h3, .markdown-body h4, .markdown-body h5, .markdown-body h6");

            let activeHeading = "";
            headingElements.forEach((heading) => {
                const rect = heading.getBoundingClientRect();
                if (rect.top <= 100) {
                    activeHeading = heading.id;
                }
            });

            if (activeHeading) {
                setActiveId(activeHeading);
            }
        };

        handleScroll();
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Hide TOC when footer is in view to avoid overlap
    useEffect(() => {
        const footer = document.querySelector("footer");
        if (!footer) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsFooterVisible(entry.isIntersecting);
            },
            {
                root: null,
                threshold: 0.05,
            }
        );

        observer.observe(footer);
        return () => observer.disconnect();
    }, []);

    // Keep active TOC item visible as the reader scrolls the article
    useEffect(() => {
        if (!activeId) return;

        const nav = navRef.current;
        const activeItem = itemsRef.current[activeId];
        if (!nav || !activeItem) return;

        const navRect = nav.getBoundingClientRect();
        const itemRect = activeItem.getBoundingClientRect();
        const edgePadding = 44;

        const isAboveView = itemRect.top < navRect.top + edgePadding;
        const isBelowView = itemRect.bottom > navRect.bottom - edgePadding;

        if (isAboveView || isBelowView) {
            activeItem.scrollIntoView({
                block: "center",
                inline: "nearest",
                behavior: "smooth",
            });
        }
    }, [activeId]);

    const handleClick = (id) => {
        const element = document.getElementById(id);
        if (element) {
            setActiveId(id);
            element.scrollIntoView({ behavior: "smooth" });
        }
    };

    const handleMouseEnter = (id) => {
        setHoveredId(id);
        const element = itemsRef.current[id];
        const nav = navRef.current;
        if (element && nav) {
            const elemRect = element.getBoundingClientRect();
            const navRect = nav.getBoundingClientRect();
            setTooltipPos({
                top: elemRect.top,
                left: navRect.right + 4 // Sát cạnh nav với khoảng cách nhỏ
            });
        }
    };

    if (headings.length === 0) return null;

    const hoveredHeading = headings.find(h => h.id === hoveredId);

    return (
        <>
            {/* Tooltip bên phải, cạnh dòng đang hover */}
            {hoveredHeading && !isFooterVisible && (
                <div
                    className="fixed z-[9999] bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-normal max-w-xs break-words pointer-events-none"
                    style={{
                        left: `${tooltipPos.left}px`,
                        top: `${tooltipPos.top}px`,
                        transform: 'translateY(-50%)'
                    }}>
                    {hoveredHeading.text}
                </div>
            )}

            <nav ref={navRef} className={`toc-scroll-on-hover hidden lg:block fixed left-4 top-[79px] w-56 h-[calc(100vh-85px)] overflow-y-auto transition-opacity duration-200 ${isFooterVisible ? "opacity-0 pointer-events-none" : "opacity-100"}`} style={{ direction: 'rtl' }}>
                <div className="bg-gradient-to-b from-blue-50/50 to-purple-50/30 border border-gray-200/50 rounded-xl p-4 shadow-sm backdrop-blur-sm" style={{ direction: 'ltr' }}>
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 pl-2">
                        Mục lục
                    </div>

                    <ul className="space-y-0 text-[12px]">
                        {headings.map((heading) => (
                            <li
                                key={heading.id}
                                ref={(el) => {
                                    if (el) itemsRef.current[heading.id] = el;
                                }}
                                style={{
                                    marginLeft: `${(heading.level - 1) * 0.75}rem`,
                                }}
                                onMouseEnter={() => handleMouseEnter(heading.id)}
                                onMouseLeave={() => setHoveredId(null)}
                            >
                                <button
                                    onClick={() => handleClick(heading.id)}
                                    className={`w-full text-left px-2.5 py-1 rounded-md transition-all duration-200 truncate ${activeId === heading.id
                                        ? "bg-blue-500/20 text-blue-700 font-semibold border-l-2 border-blue-500"
                                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100/50"
                                        }`}
                                >
                                    {heading.text}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            </nav>
        </>
    );
}
