function resolveUrl(url, baseUrl) {
    if (!url) return "";

    try {
        return baseUrl ? new URL(url, baseUrl).toString() : url;
    } catch {
        return url;
    }
}

function extractImageFromLine(line) {
    const markdownImage = line.match(/!\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/);
    if (markdownImage?.[1]) return markdownImage[1];

    const htmlImage = line.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/i);
    if (htmlImage?.[1]) return htmlImage[1];

    return "";
}

/**
 * Lấy ảnh cover đầu tiên nằm giữa H1 đầu tiên và H2 đầu tiên.
 * Nếu không có ảnh trong đúng vùng này thì trả về chuỗi rỗng để dùng ảnh mặc định.
 */
export function extractCoverImageFromMarkdown(md, baseUrl = "") {
    if (!md) return "";

    const lines = md.split("\n");
    let inCodeFence = false;
    let seenFirstH1 = false;

    const isHeading = (trimmed) => trimmed.match(/^(#{1,6})\s+/);

    for (const line of lines) {
        const trimmed = line.trim();

        if (trimmed.startsWith("```")) {
            inCodeFence = !inCodeFence;
            continue;
        }

        if (inCodeFence) continue;

        const headingMatch = isHeading(trimmed);
        if (headingMatch) {
            const level = headingMatch[1].length;

            if (level === 1 && !seenFirstH1) {
                seenFirstH1 = true;
                continue;
            }

            if (level === 2 && seenFirstH1) {
                break;
            }

            continue;
        }

        if (seenFirstH1) {
            const imageUrl = extractImageFromLine(line);
            if (imageUrl) return resolveUrl(imageUrl, baseUrl);
        }
    }

    return "";
}

/**
 * Xóa ảnh cover đầu tiên nằm giữa H1 đầu tiên và H2 đầu tiên.
 * Dùng cho trang markdown để ảnh đó không được render lại trong nội dung bài.
 */
export function stripCoverImageFromMarkdown(md) {
    if (!md) return "";

    const lines = md.split("\n");
    const output = [];
    let inCodeFence = false;
    let seenFirstH1 = false;
    let removedCoverImage = false;

    const isHeading = (trimmed) => trimmed.match(/^(#{1,6})\s+/);
    const isImageLine = (trimmed) =>
        /^!\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)\s*$/.test(trimmed) ||
        /^<img[^>]+src=["'][^"']+["'][^>]*>\s*$/i.test(trimmed);
    const imagePattern = /!\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)|<img[^>]+src=["'][^"']+["'][^>]*>/i;

    for (const line of lines) {
        const trimmed = line.trim();

        if (trimmed.startsWith("```")) {
            inCodeFence = !inCodeFence;
            output.push(line);
            continue;
        }

        if (inCodeFence) {
            output.push(line);
            continue;
        }

        const headingMatch = isHeading(trimmed);
        if (headingMatch) {
            const level = headingMatch[1].length;

            if (level === 1 && !seenFirstH1) {
                seenFirstH1 = true;
            } else if (level === 2 && seenFirstH1) {
                output.push(line);
                continue;
            }

            output.push(line);
            continue;
        }

        if (seenFirstH1 && !removedCoverImage && isImageLine(trimmed)) {
            removedCoverImage = true;
            continue;
        }

        if (seenFirstH1 && !removedCoverImage && imagePattern.test(line)) {
            removedCoverImage = true;
            const cleanedLine = line.replace(imagePattern, "").trim();
            if (cleanedLine) {
                output.push(cleanedLine);
            }
            continue;
        }

        output.push(line);
    }

    return output.join("\n");
}