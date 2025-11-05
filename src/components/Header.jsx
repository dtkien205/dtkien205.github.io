import React from "react";
import { NavLink, Link } from "react-router-dom";

const navItems = [
  { label: "Home", href: "/" },
  { label: "CTF Writeups", href: "/ctf-writeups" },
  { label: "Web Vulnerabilities", href: "/webvulns" },
  { label: "Web Lab", href: "/webvulnslab" },
  { label: "About Me", href: "/about-me" },
];

export default function Header() {
  return (
    <header className="bg-brand text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              aria-label="Go to home"
              className="font-extrabold text-2xl tracking-tight focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
            >
              Kido's Blogs
            </Link>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm">
            {navItems.map((n) => (
              <NavLink
                key={n.label}
                to={n.href}
                className={({ isActive }) =>
                  `relative px-1 py-2 font-semibold transition-colors after:content-[''] after:absolute after:left-0 after:-bottom-1 after:h-0.5 after:w-0 after:bg-white after:transition-all hover:after:w-full ${
                    isActive ? "text-white" : "text-white/90 hover:text-white"
                  }`
                }
              >
                {n.label}
              </NavLink>
            ))}
          </nav>

          <button className="md:hidden border border-white/40 rounded px-3 py-1">
            Menu
          </button>
        </div>
      </div>
    </header>
  );
}
