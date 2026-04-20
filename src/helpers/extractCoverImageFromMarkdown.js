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
 * Nếu không có H1 thì tìm từ đầu file.
 * Nếu không có ảnh trong đúng vùng này thì trả về chuỗi rỗng để dùng ảnh mặc định.
 */
export function extractCoverImageFromMarkdown(md, baseUrl = "") {
    if (!md) return "";

    const lines = md.split("\n");
    let inCodeFence = false;
    let seenFirstH1 = false;
    let hasH1 = false;

    const isHeading = (trimmed) => trimmed.match(/^(#{1,6})\s+/);

    // First pass: check if there's an H1
    for (const line of lines) {
        const trimmed = line.trim();
        const headingMatch = isHeading(trimmed);
        if (headingMatch && headingMatch[1].length === 1) {
            hasH1 = true;
            break;
        }
    }

    // Second pass: extract image
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

            // If there's H1, follow original logic (H1->H2)
            if (hasH1) {
                if (level === 1 && !seenFirstH1) {
                    seenFirstH1 = true;
                    continue;
                }

                if (level === 2 && seenFirstH1) {
                    break;
                }

                continue;
            } else {
                // If no H1, stop at first H2 or any heading level > 1
                if (level > 1) {
                    break;
                }
                continue;
            }
        }

        // Extract image: either after H1 (if exists) or from start (if no H1)
        if (hasH1 && !seenFirstH1) continue; // Skip until we find H1

        const imageUrl = extractImageFromLine(line);
        if (imageUrl) return resolveUrl(imageUrl, baseUrl);
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