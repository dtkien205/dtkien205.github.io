/**
 * Script kiểm tra GitHub API Rate Limit
 * Chạy: node check-github-rate-limit.js
 */

import https from 'https';
import dotenv from 'dotenv';

// Load .env file
dotenv.config();

// Lấy token từ environment variable hoặc để trống (unauthenticated)
const GITHUB_TOKEN = process.env.VITE_GH_TOKEN || process.env.GITHUB_TOKEN || '';

function makeRequest(path) {
    const options = {
        hostname: 'api.github.com',
        path: path,
        method: 'GET',
        headers: {
            'User-Agent': 'Kido-Blogs-Rate-Limit-Checker',
            ...(GITHUB_TOKEN && { 'Authorization': `Bearer ${GITHUB_TOKEN}` })
        }
    };

    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                try {
                    const result = JSON.parse(data);
                    resolve({ status: res.statusCode, data: result });
                } catch (error) {
                    reject(error);
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.end();
    });
}

function checkRateLimit() {
    return makeRequest('/rate_limit');
}

function checkUser() {
    return makeRequest('/user');
}

async function main() {
    try {
        console.log('🔍 Đang kiểm tra GitHub API Rate Limit & Token...\n');

        // Kiểm tra token validity
        if (GITHUB_TOKEN) {
            console.log('🔐 Đang xác thực token...');
            const userResponse = await checkUser();

            if (userResponse.status === 200) {
                console.log('✅ Token HOẠT ĐỘNG!');
                console.log(`   👤 User: ${userResponse.data.login}`);
                console.log(`   📧 Email: ${userResponse.data.email || 'N/A'}`);
                console.log(`   🏢 Company: ${userResponse.data.company || 'N/A'}`);
                console.log(`   🔗 Profile: ${userResponse.data.html_url}`);
                console.log(`   📅 Created: ${new Date(userResponse.data.created_at).toLocaleDateString('vi-VN')}`);
            } else if (userResponse.status === 401) {
                console.log('❌ Token KHÔNG HỢP LỆ hoặc ĐÃ HẾT HẠN!');
                console.log('   Error:', userResponse.data.message);
                process.exit(1);
            } else {
                console.log(`⚠️  Token response: ${userResponse.status}`);
                console.log('   Message:', userResponse.data.message || 'Unknown error');
            }
            console.log();
        }

        const response = await checkRateLimit();
        const data = response.data;
        const core = data.resources.core;
        const search = data.resources.search;

        // Tính thời gian reset
        const resetDate = new Date(core.reset * 1000);
        const now = new Date();
        const minutesUntilReset = Math.ceil((resetDate - now) / 1000 / 60);

        console.log('📊 GITHUB API RATE LIMIT STATUS');
        console.log('═'.repeat(50));
        console.log(`🔐 Authentication: ${GITHUB_TOKEN ? '✅ Authenticated' : '❌ Unauthenticated'}`);
        console.log();

        console.log('📦 Core API:');
        console.log(`   Limit:     ${core.limit.toLocaleString()} requests/hour`);
        console.log(`   Used:      ${core.used.toLocaleString()} requests`);
        console.log(`   Remaining: ${core.remaining.toLocaleString()} requests`);
        console.log(`   Reset:     ${resetDate.toLocaleString('vi-VN')} (${minutesUntilReset} phút nữa)`);

        // Tính % đã dùng
        const usedPercent = ((core.used / core.limit) * 100).toFixed(1);
        const remainingPercent = ((core.remaining / core.limit) * 100).toFixed(1);

        console.log();
        console.log(`   📊 Usage: ${usedPercent}% | Remaining: ${remainingPercent}%`);

        // Progress bar
        const barLength = 40;
        const usedBars = Math.round((core.used / core.limit) * barLength);
        const remainingBars = barLength - usedBars;
        const progressBar = '█'.repeat(usedBars) + '░'.repeat(remainingBars);
        console.log(`   [${progressBar}]`);

        console.log();
        console.log('🔍 Search API:');
        console.log(`   Limit:     ${search.limit.toLocaleString()} requests/hour`);
        console.log(`   Used:      ${search.used.toLocaleString()} requests`);
        console.log(`   Remaining: ${search.remaining.toLocaleString()} requests`);

        console.log();
        console.log('═'.repeat(50));

        // Warnings
        if (core.remaining < 100) {
            console.log('⚠️  WARNING: Số request còn lại rất ít!');
        } else if (core.remaining < 500) {
            console.log('⚡ CAUTION: Nên tiết kiệm API calls');
        } else if (core.remaining > 4000) {
            console.log('✅ GOOD: Còn nhiều requests!');
        }

        // Suggestions
        console.log();
        console.log('💡 GỢI Ý:');
        if (!GITHUB_TOKEN) {
            console.log('   • Dùng GitHub token để tăng limit lên 5,000/hour');
            console.log('   • Chạy: $env:GITHUB_TOKEN="your_token_here"; node check-github-rate-limit.js');
        }
        if (core.remaining < 1000) {
            console.log('   • Tăng cache duration trong code');
            console.log('   • Sử dụng lazy loading cho last modified dates');
            console.log('   • Giảm số lượng parallel requests');
        }

        // Estimate blogs can fetch
        console.log();
        console.log('📈 ƯỚC TÍNH:');
        const blogsCanFetch = Math.floor(core.remaining / 1); // 1 request per blog (README only)
        const blogsWithDates = Math.floor(core.remaining / 2); // 2 requests per blog (README + date)
        console.log(`   • Có thể fetch ${blogsCanFetch} blogs (chỉ README)`);
        console.log(`   • Hoặc ${blogsWithDates} blogs (README + last modified)`);

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

main();
