import React from "react";
import { NavLink, Link } from "react-router-dom";

const navItems = [
  { label: "Home", href: "/" },
  { label: "CTF Writeups", href: "/ctf-writeups" },
  { label: "Web Vulnerabilities", href: "/webvulns" },
  { label: "Web Lab", href: "/webvulnslab" },
  { label: "Attack Lab", href: "/attack-lab" },
];

export default function Header() {
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled
        ? "bg-white/80 backdrop-blur-lg shadow-lg border-b border-gray-200/50"
        : "bg-blue-600"
        }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="flex items-center justify-between py-4">
          {/* Logo/Brand - NO ICON */}
          <Link
            to="/"
            aria-label="Go to home"
            className={`group font-extrabold text-2xl tracking-tight transition-all duration-300 ${isScrolled
              ? "text-blue-600 hover:opacity-80"
              : "text-white hover:text-blue-100"
              }`}
          >
            Kido's Blogs
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((n) => (
              <NavLink
                key={n.label}
                to={n.href}
                className={({ isActive }) =>
                  `relative px-4 py-2 font-semibold rounded-lg transition-all duration-200 ${isScrolled
                    ? isActive
                      ? "text-white bg-blue-600 shadow-md"
                      : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                    : isActive
                      ? "text-white bg-white/20 backdrop-blur-sm"
                      : "text-white/90 hover:text-white hover:bg-white/10"
                  }`
                }
              >
                {n.label}
              </NavLink>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`md:hidden flex items-center justify-center w-10 h-10 rounded-lg transition-all ${isScrolled
              ? "border border-gray-300 text-gray-700 hover:bg-gray-100"
              : "border border-white/40 text-white hover:bg-white/10"
              }`}
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <nav className="md:hidden pb-4 space-y-2 animate-fade-in-up">
            {navItems.map((n) => (
              <NavLink
                key={n.label}
                to={n.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `block px-4 py-3 font-semibold rounded-lg transition-all duration-200 ${isScrolled
                    ? isActive
                      ? "text-white bg-blue-600 shadow-md"
                      : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                    : isActive
                      ? "text-white bg-white/20 backdrop-blur-sm"
                      : "text-white/90 hover:text-white hover:bg-white/10"
                  }`
                }
              >
                {n.label}
              </NavLink>
            ))}
          </nav>
        )}
      </div>

      {/* Decorative gradient line */}
      {!isScrolled && (
        <div className="h-1 bg-gradient-to-r from-transparent via-white/50 to-transparent" />
      )}
    </header>
  );
}
