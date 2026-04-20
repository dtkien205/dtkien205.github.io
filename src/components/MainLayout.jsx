import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import ScrollToTop from "./ScrollToTop";

export default function MainLayout() {
  const { pathname } = useLocation();

  const isMarkdownPage =
    /^\/(ctf-writeups|webvulns|webvulnslab|attack-lab|cheat-sheet|license-plate-detection|log-anomaly-detection)\/[^/]+$/.test(
      pathname
    ) ||
    pathname === "/license-plate-detection" ||
    pathname === "/log-anomaly-detection";

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main
        className={
          isMarkdownPage
            ? "w-full max-w-none px-0 flex-1"
            : "container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl flex-1 py-8"
        }
      >
        <Outlet />
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  );
}
