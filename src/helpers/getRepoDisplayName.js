import { toTitleCase } from "./toTitleCase";

/**
 * Convert repo name sang display name đẹp
 * @param {string} repoName - Tên repo (vd: "ctf-writeups")
 * @returns {string} Display name (vd: "CTF Writeups")
 */
export function getRepoDisplayName(repoName) {
    const displayNames = {
        "ctf-writeups": "CTF Writeups",
        webvulns: "Web Vulns",
        webvulnslab: "Web Vulns Lab",
    };
    return displayNames[repoName] || toTitleCase(repoName.replace(/-/g, " "));
}
