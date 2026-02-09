/**
 * GitHub API Rate Limit & Token Checker - Browser Console Version
 * Copy toàn bộ script này và paste vào Browser Console (F12)
 * 
 * Cách dùng:
 * 1. Nhấn F12 để mở Developer Tools
 * 2. Chuyển sang tab Console
 * 3. Copy và paste toàn bộ code này
 * 4. Nhấn Enter
 */

(async function checkGitHubToken() {
    // Lấy token từ localStorage hoặc nhập thủ công
    const TOKEN = localStorage.getItem('GITHUB_TOKEN');

    console.log('%c🔍 GITHUB TOKEN & RATE LIMIT CHECKER', 'font-size: 20px; font-weight: bold; color: #2ea44f');
    console.log('%c═══════════════════════════════════════════════════', 'color: #888');
    console.log('');

    try {
        // Kiểm tra token validity
        if (TOKEN) {
            console.log('%c🔐 Đang xác thực token...', 'color: #0969da; font-weight: bold');

            const userResponse = await fetch('https://api.github.com/user', {
                headers: {
                    'Authorization': `Bearer ${TOKEN}`,
                    'Accept': 'application/vnd.github+json'
                }
            });

            if (userResponse.ok) {
                const userData = await userResponse.json();
                console.log('%c✅ TOKEN HOẠT ĐỘNG!', 'color: #1a7f37; font-weight: bold; font-size: 16px');
                console.log('');

                // Tạo bảng thông tin user đẹp
                console.table({
                    '👤 Username': userData.login,
                    '📛 Name': userData.name || 'N/A',
                    '📧 Email': userData.email || 'N/A',
                    '🏢 Company': userData.company || 'N/A',
                    '📍 Location': userData.location || 'N/A',
                    '📝 Bio': userData.bio || 'N/A',
                    '👥 Followers': userData.followers,
                    '👁️ Following': userData.following,
                    '📦 Public Repos': userData.public_repos,
                    '📅 Account Created': new Date(userData.created_at).toLocaleDateString('vi-VN')
                });

                console.log('%c🔗 Profile:', 'color: #0969da; font-weight: bold', userData.html_url);
                console.log('');
            } else {
                const errorData = await userResponse.json();
                console.log('%c❌ TOKEN KHÔNG HỢP LỆ hoặc ĐÃ HẾT HẠN!', 'color: #cf222e; font-weight: bold; font-size: 16px');
                console.log('%cError:', 'color: #cf222e', errorData.message);
                console.log('');
                return;
            }
        }

        // Kiểm tra rate limit
        console.log('%c📊 Đang kiểm tra Rate Limit...', 'color: #0969da; font-weight: bold');

        const rateLimitResponse = await fetch('https://api.github.com/rate_limit', {
            headers: {
                ...(TOKEN && {
                    'Authorization': `Bearer ${TOKEN}`,
                    'Accept': 'application/vnd.github+json'
                })
            }
        });

        const data = await rateLimitResponse.json();
        const core = data.resources.core;
        const search = data.resources.search;
        const graphql = data.resources.graphql;

        // Tính toán
        const resetDate = new Date(core.reset * 1000);
        const minutesUntilReset = Math.ceil((core.reset * 1000 - Date.now()) / 60000);
        const usedPercent = ((core.used / core.limit) * 100).toFixed(1);
        const remainingPercent = ((core.remaining / core.limit) * 100).toFixed(1);

        // Hiển thị kết quả
        console.log('%c══════════════════════════════════════════════════', 'color: #888');
        console.log('%c📊 GITHUB API RATE LIMIT STATUS', 'font-size: 16px; font-weight: bold; color: #0969da');
        console.log('%c══════════════════════════════════════════════════', 'color: #888');
        console.log('');

        console.log(`%c🔐 Authentication: ${TOKEN ? '✅ Authenticated' : '❌ Unauthenticated'}`,
            'font-weight: bold; color: ' + (TOKEN ? '#1a7f37' : '#cf222e'));
        console.log('');

        // Core API
        console.log('%c📦 CORE API', 'font-size: 14px; font-weight: bold; color: #0969da');
        console.table({
            'Limit': `${core.limit.toLocaleString()} requests/hour`,
            'Used': `${core.used.toLocaleString()} requests`,
            'Remaining': `${core.remaining.toLocaleString()} requests`,
            'Usage': `${usedPercent}%`,
            'Remaining %': `${remainingPercent}%`,
            'Reset At': resetDate.toLocaleString('vi-VN'),
            'Reset In': `${minutesUntilReset} phút`
        });

        // Progress bar
        const barLength = 40;
        const usedBars = Math.round((core.used / core.limit) * barLength);
        const remainingBars = barLength - usedBars;
        const progressBar = '█'.repeat(usedBars) + '░'.repeat(remainingBars);
        console.log(`%c[${progressBar}] ${usedPercent}%`, 'font-family: monospace; font-size: 12px');
        console.log('');

        // Search API
        console.log('%c🔍 SEARCH API', 'font-size: 14px; font-weight: bold; color: #0969da');
        console.table({
            'Limit': `${search.limit.toLocaleString()} requests/hour`,
            'Used': `${search.used.toLocaleString()} requests`,
            'Remaining': `${search.remaining.toLocaleString()} requests`
        });
        console.log('');

        // GraphQL API
        console.log('%c📈 GRAPHQL API', 'font-size: 14px; font-weight: bold; color: #0969da');
        console.table({
            'Limit': `${graphql.limit.toLocaleString()} requests/hour`,
            'Used': `${graphql.used.toLocaleString()} requests`,
            'Remaining': `${graphql.remaining.toLocaleString()} requests`
        });
        console.log('');

        // Warnings & Suggestions
        console.log('%c══════════════════════════════════════════════════', 'color: #888');

        if (core.remaining < 100) {
            console.log('%c⚠️ WARNING: Số request còn lại rất ít!', 'color: #d29922; font-weight: bold');
        } else if (core.remaining < 500) {
            console.log('%c⚡ CAUTION: Nên tiết kiệm API calls', 'color: #d29922; font-weight: bold');
        } else if (core.remaining > 4000) {
            console.log('%c✅ GOOD: Còn nhiều requests!', 'color: #1a7f37; font-weight: bold');
        }

        console.log('');
        console.log('%c💡 GỢI Ý:', 'font-weight: bold; color: #0969da');

        if (!TOKEN) {
            console.log('   • Dùng GitHub token để tăng limit lên 5,000/hour');
            console.log('   • Lưu token: localStorage.setItem("GITHUB_TOKEN", "your_token_here")');
            console.log('   • Sau đó chạy lại script này');
        }

        if (core.remaining < 1000) {
            console.log('   • Tăng cache duration trong code');
            console.log('   • Sử dụng lazy loading cho last modified dates');
            console.log('   • Giảm số lượng parallel requests');
        }

        console.log('');
        console.log('%c📈 ƯỚC TÍNH:', 'font-weight: bold; color: #0969da');
        const blogsCanFetch = Math.floor(core.remaining / 1);
        const blogsWithDates = Math.floor(core.remaining / 2);
        console.log(`   • Có thể fetch ${blogsCanFetch.toLocaleString()} blogs (chỉ README)`);
        console.log(`   • Hoặc ${blogsWithDates.toLocaleString()} blogs (README + last modified)`);

        console.log('');
        console.log('%c══════════════════════════════════════════════════', 'color: #888');

        // Return data để có thể access
        return {
            user: TOKEN ? await (await fetch('https://api.github.com/user', {
                headers: { 'Authorization': `Bearer ${TOKEN}` }
            })).json() : null,
            rateLimit: data
        };

    } catch (error) {
        console.error('%c❌ Error:', 'color: #cf222e; font-weight: bold', error.message);
        console.error(error);
    }
})();

// Hàm tiện ích để lưu token
console.log('%c💾 Để lưu token, dùng:', 'color: #0969da; font-weight: bold');
console.log('localStorage.setItem("GITHUB_TOKEN", "your_token_here")');
