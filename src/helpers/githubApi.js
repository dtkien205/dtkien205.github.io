/**
 * GitHub API utilities với optimization
 */

/**
 * Tạo headers cho GitHub API request với authentication
 * @returns {Object} Headers object
 */
export function getGitHubHeaders() {
    const headers = {};
    const token = import.meta.env.VITE_GH_TOKEN;
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
}

/**
 * Fetch với retry logic
 * @param {string} url - URL to fetch
 * @param {Object} options - Fetch options
 * @param {number} retries - Number of retries
 * @returns {Promise<Response>}
 */
async function fetchWithRetry(url, options = {}, retries = 2) {
    try {
        const response = await fetch(url, options);

        // Check rate limit
        const remaining = response.headers.get('X-RateLimit-Remaining');
        if (remaining && parseInt(remaining) < 10) {
            console.warn('⚠️ GitHub API rate limit thấp:', remaining, 'requests còn lại');
        }

        return response;
    } catch (error) {
        if (retries > 0) {
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s
            return fetchWithRetry(url, options, retries - 1);
        }
        throw error;
    }
}

/**
 * Fetch last commit date cho một path trong repo
 * @param {Object} params - Parameters
 * @param {string} params.owner - Repo owner
 * @param {string} params.repo - Repo name
 * @param {string} params.path - Path trong repo
 * @param {string} params.branch - Branch name
 * @param {Object} params.headers - Request headers
 * @returns {Promise<string>} ISO date string hoặc empty string
 */
export async function fetchLastCommitDate({ owner, repo, path, branch, headers }) {
    try {
        const commitsUrl = `https://api.github.com/repos/${owner}/${repo}/commits?path=${encodeURIComponent(path)}&page=1&per_page=1&ref=${branch}`;
        const response = await fetch(commitsUrl, { headers });

        if (!response.ok) return "";

        const commits = await response.json();
        if (Array.isArray(commits) && commits.length > 0) {
            return commits[0]?.commit?.author?.date || "";
        }
        return "";
    } catch {
        return "";
    }
}

/**
 * Fetch README content từ raw GitHub
 * @param {Object} params - Parameters
 * @param {string} params.owner - Repo owner
 * @param {string} params.repo - Repo name
 * @param {string} params.branch - Branch name
 * @param {string} params.path - Path đến directory chứa README
 * @returns {Promise<string|null>} README content hoặc null nếu không tìm thấy
 */
export async function fetchReadmeContent({ owner, repo, branch, path }) {
    try {
        const url = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${path}/README.md`;
        const response = await fetch(url);

        if (!response.ok) return null;

        return await response.text();
    } catch {
        return null;
    }
}

/**
 * Fetch danh sách directories từ GitHub repo với optimization
 * @param {Object} params - Parameters
 * @param {string} params.owner - Repo owner
 * @param {string} params.repo - Repo name
 * @param {string} params.path - Path trong repo
 * @param {string} params.branch - Branch name
 * @param {Object} params.headers - Request headers
 * @returns {Promise<Array>} Array of directory objects
 */
export async function fetchDirectories({ owner, repo, path, branch, headers }) {
    try {
        const listUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`;
        const response = await fetchWithRetry(listUrl, { headers });

        if (!response.ok) return [];

        const list = await response.json();
        return Array.isArray(list) ? list.filter((e) => e.type === "dir") : [];
    } catch {
        return [];
    }
}
