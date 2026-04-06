import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import RepoIndex from "./pages/RepoIndex";
import RepoReadmePage from "./pages/RepoReadmePage";
import CombinedRepoIndex from "./pages/CombinedRepoIndex";
import Home from "./pages/Home";
import markdownRoutes from "./config/markdownRoutes";
import MainLayout from "./components/MainLayout";
import { useWarmupGithubCache } from "./hooks/useWarmupGithubCache";

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
  useWarmupGithubCache();

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
          {/* PROJECT (License Plate Detection + Log Anomaly Detection) */}
          {/* ================================ */}
          <Route
            path="/project"
            element={
              <CombinedRepoIndex
                repos={[
                  {
                    owner: markdownRoutes.licensePlateDetectionRepo.owner,
                    repo: markdownRoutes.licensePlateDetectionRepo.repo,
                    branch: markdownRoutes.licensePlateDetectionRepo.branch,
                    path: markdownRoutes.licensePlateDetectionRepo.path,
                    displayName: "License Plate Detection",
                    basePath: "/license-plate-detection",
                    detailPath: "/license-plate-detection",
                    mode: "root-readme",
                  },
                  {
                    owner: markdownRoutes.logAnomalyDetectionRepo.owner,
                    repo: markdownRoutes.logAnomalyDetectionRepo.repo,
                    branch: markdownRoutes.logAnomalyDetectionRepo.branch,
                    path: markdownRoutes.logAnomalyDetectionRepo.path,
                    displayName: "Log Anomaly Detection",
                    basePath: "/log-anomaly-detection",
                    detailPath: "/log-anomaly-detection",
                    mode: "root-readme",
                  },
                ]}
                basePath="/project"
              />
            }
          />

          {/* ================================ */}
          {/* OTHER (Attack Lab + Cheat Sheet) */}
          {/* ================================ */}
          <Route
            path="/other"
            element={
              <CombinedRepoIndex
                repos={[
                  {
                    owner: markdownRoutes.attackLabRepo.owner,
                    repo: markdownRoutes.attackLabRepo.repo,
                    branch: markdownRoutes.attackLabRepo.branch,
                    path: markdownRoutes.attackLabRepo.path,
                    displayName: "Attack Lab",
                    basePath: "/attack-lab",
                  },
                  {
                    owner: markdownRoutes.cheatSheetRepo.owner,
                    repo: markdownRoutes.cheatSheetRepo.repo,
                    branch: markdownRoutes.cheatSheetRepo.branch,
                    path: markdownRoutes.cheatSheetRepo.path,
                    displayName: "Cheat Sheet",
                    basePath: "/cheat-sheet",
                  },
                ]}
                basePath="/other"
              />
            }
          />

          {/* ================================ */}
          {/* ATTACK LAB */}
          {/* ================================ */}
          <Route
            path="/attack-lab/:slug"
            element={
              <RepoReadmePage repoConfig={markdownRoutes.attackLabRepo} />
            }
          />

          {/* ================================ */}
          {/* CHEAT SHEET */}
          {/* ================================ */}
          <Route
            path="/cheat-sheet/:slug"
            element={
              <RepoReadmePage repoConfig={markdownRoutes.cheatSheetRepo} />
            }
          />

          {/* ================================ */}
          {/* LICENSE PLATE DETECTION */}
          {/* ================================ */}
          <Route
            path="/license-plate-detection/:slug"
            element={
              <RepoReadmePage repoConfig={markdownRoutes.licensePlateDetectionRepo} />
            }
          />
          <Route
            path="/license-plate-detection"
            element={
              <RepoReadmePage
                repoConfig={{
                  ...markdownRoutes.licensePlateDetectionRepo,
                  rootReadme: true,
                }}
              />
            }
          />

          {/* ================================ */}
          {/* LOG-BASED ANOMALY DETECTION */}
          {/* ================================ */}
          <Route
            path="/log-anomaly-detection/:slug"
            element={
              <RepoReadmePage repoConfig={markdownRoutes.logAnomalyDetectionRepo} />
            }
          />
          <Route
            path="/log-anomaly-detection"
            element={
              <RepoReadmePage
                repoConfig={{
                  ...markdownRoutes.logAnomalyDetectionRepo,
                  rootReadme: true,
                }}
              />
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
