import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import RepoIndex from "./pages/RepoIndex";
import RepoReadmePage from "./pages/RepoReadmePage";
import Home from "./pages/Home";
import markdownRoutes from "./config/markdownRoutes";
import MainLayout from "./components/MainLayout";

/**
 * Main App Component - Định nghĩa routing cho toàn bộ ứng dụng
 * Routes:
 * - / : Home page
 * - /ctf-writeups : CTF Writeups index
 * - /ctf-writeups/:slug : CTF Writeups detail
 * - /webvulns : Web Vulnerabilities index
 * - /webvulns/:slug : Web Vulnerabilities detail
 * - /webvulnslab : Web Vulnerabilities Lab index
 * - /webvulnslab/:slug : Web Vulnerabilities Lab detail
 */
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          {/* ================================ */}
          {/* HOME PAGE */}
          {/* ================================ */}
          <Route path="/" element={<Home />} />

          {/* ================================ */}
          {/* CTF WRITEUPS */}
          {/* ================================ */}
          <Route
            path="/ctf-writeups"
            element={
              <RepoIndex
                owner={markdownRoutes.ctfWriteupsRepo.owner}
                repo={markdownRoutes.ctfWriteupsRepo.repo}
                branch={markdownRoutes.ctfWriteupsRepo.branch}
                path={markdownRoutes.ctfWriteupsRepo.path}
                basePath="/ctf-writeups"
                showExcerpt={false}
              />
            }
          />
          <Route
            path="/ctf-writeups/:slug"
            element={
              <RepoReadmePage repoConfig={markdownRoutes.ctfWriteupsRepo} />
            }
          />

          {/* ================================ */}
          {/* WEB VULNERABILITIES */}
          {/* ================================ */}
          <Route
            path="/webvulns"
            element={
              <RepoIndex
                owner={markdownRoutes.webVulnsRepo.owner}
                repo={markdownRoutes.webVulnsRepo.repo}
                branch={markdownRoutes.webVulnsRepo.branch}
                path={markdownRoutes.webVulnsRepo.path}
                basePath="/webvulns"
              />
            }
          />
          <Route
            path="/webvulns/:slug"
            element={
              <RepoReadmePage repoConfig={markdownRoutes.webVulnsRepo} />
            }
          />

          {/* ================================ */}
          {/* WEB VULNERABILITIES LAB */}
          {/* ================================ */}
          <Route
            path="/webvulnslab"
            element={
              <RepoIndex
                owner={markdownRoutes.webVulnsLabRepo.owner}
                repo={markdownRoutes.webVulnsLabRepo.repo}
                branch={markdownRoutes.webVulnsLabRepo.branch}
                path={markdownRoutes.webVulnsLabRepo.path}
                basePath="/webvulnslab"
              />
            }
          />
          <Route
            path="/webvulnslab/:slug"
            element={
              <RepoReadmePage repoConfig={markdownRoutes.webVulnsLabRepo} />
            }
          />

          {/* ================================ */}
          {/* ATTACK LAB */}
          {/* ================================ */}
          <Route
            path="/attack-lab"
            element={
              <RepoIndex
                owner={markdownRoutes.attackLabRepo.owner}
                repo={markdownRoutes.attackLabRepo.repo}
                branch={markdownRoutes.attackLabRepo.branch}
                path={markdownRoutes.attackLabRepo.path}
                basePath="/attack-lab"
              />
            }
          />
          <Route
            path="/attack-lab/:slug"
            element={
              <RepoReadmePage repoConfig={markdownRoutes.attackLabRepo} />
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
