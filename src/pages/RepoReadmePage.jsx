import React from "react";
import { useParams } from "react-router-dom";
import MarkdownPage from "../components/MarkdownPage";

export default function RepoReadmePage({ repoConfig }) {
  const { slug } = useParams();
  const { owner, repo, branch = "main", path = "" } = repoConfig;

  const dirPath = `${path ? path + "/" : ""}${slug}/`;
  const filePath = `${dirPath}README.md`;

  // Nội dung README (markdown)
  const sourceUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${filePath}`;
  // Base để resolve ảnh/asset tương đối trong README
  const assetBase = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${dirPath}`;

  return <MarkdownPage sourceUrl={sourceUrl} assetBase={assetBase} />;
}
