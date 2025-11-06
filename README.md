#  Kido's Blogs

> Nền tảng blog cá nhân chia sẻ CTF writeups, nghiên cứu lỗ hổng web và các bài lab bảo mật - được xây dựng bằng React, Vite và GitHub API.

[![Live Demo](https://img.shields.io/badge/demo-live-success?style=for-the-badge)](https://dtkien205.github.io)
[![GitHub](https://img.shields.io/badge/github-source-blue?style=for-the-badge&logo=github)](https://github.com/dtkien205/dtkien205.github.io)

---

## Danh mục blog
1. **CTF Writeups** (`WriteUpCTF`): Lời giải các thử thách Capture The Flag
2. **Web Vulnerabilities** (`WebVulnerabilities`): Nghiên cứu về các lỗ hổng bảo mật web phổ biến
3. **Web Labs** (`WebVulnerabilitiesLab`): Các bài lab thực hành bảo mật với truy cập mã nguồn

---

### Frontend
- **[React 18.3.1](https://react.dev/)** - Thư viện UI
- **[Vite 5.4.10](https://vitejs.dev/)** - Build tool và dev server
- **[React Router 6.27.0](https://reactrouter.com/)** - Client-side routing
- **[Tailwind CSS 3.4.14](https://tailwindcss.com/)** - CSS framework utility-first

### Markdown & Syntax
- **[react-markdown 9.0.1](https://github.com/remarkjs/react-markdown)** - Markdown renderer
- **[remark-gfm 4.0.0](https://github.com/remarkjs/remark-gfm)** - GitHub Flavored Markdown
- **[rehype-slug 6.0.0](https://github.com/rehypejs/rehype-slug)** - Thêm IDs cho headings
- **[rehype-autolink-headings 7.1.0](https://github.com/rehypejs/rehype-autolink-headings)** - Thêm links cho headings
- **[highlight.js 11.10.0](https://highlightjs.org/)** - Syntax highlighting

### Styling
- **[github-markdown-css 5.7.0](https://github.com/sindresorhus/github-markdown-css)** - GitHub markdown styles
- **[PostCSS](https://postcss.org/)** - CSS transformations
- **[Autoprefixer](https://github.com/postcss/autoprefixer)** - Vendor prefixes

### APIs & Data
- **GitHub REST API** - Lấy nội dung blog
- **GitHub Raw Content** - Truy cập trực tiếp markdown files
- **LocalStorage API** - Caching phía client

---

## Cấu trúc 

```
Kido-Blogs/
├── public/
│   ├── 404.html              # SPA routing fallback
│   └── .nojekyll             # Tắt Jekyll processing
├── src/
│   ├── components/           # React components
│   │   ├── BlogCard.jsx      # Card blog với gradient effects
│   │   ├── Divider.jsx       # Phân chia section
│   │   ├── Footer.jsx        # Footer với social links
│   │   ├── GroupRow.jsx      # Container nhóm blog
│   │   ├── Header.jsx        # Sticky header với glassmorphism
│   │   ├── IntroHome.jsx     # Hero section trang chủ
│   │   ├── IntroPage.jsx     # Intro section repository
│   │   ├── MainLayout.jsx    # Layout wrapper chính
│   │   ├── MarkdownPage.jsx  # Renderer nội dung markdown
│   │   ├── PageLoader.jsx    # Loading spinner
│   │   ├── ScrollToTop.jsx   # Nút scroll-to-top
│   │   └── SearchBar.jsx     # Thanh tìm kiếm với glassmorphism
│   ├── config/
│   │   ├── introSections.js  # Mô tả repository
│   │   └── markdownRoutes.js # Cấu hình GitHub repos
│   ├── helpers/              # Các hàm tiện ích
│   │   ├── cacheUtils.js     # Quản lý LocalStorage cache
│   │   ├── extractTitleAndExcerpt.js # Parse markdown
│   │   ├── formatDate.js     # Format ngày tháng
│   │   ├── getRepoDisplayName.js # Mapping tên repository
│   │   ├── githubApi.js      # Utilities GitHub API
│   │   ├── groupByRepo.js    # Logic nhóm blog
│   │   ├── humanizeRepoName.js # Humanize tên repo
│   │   ├── index.js          # Export helpers
│   │   └── toTitleCase.js    # Chuyển title case
│   ├── hooks/                # Custom React hooks
│   │   ├── useFetchAllBlogs.js # Lấy blog từ nhiều repos
│   │   ├── useHighlightCode.js # Syntax highlighting
│   │   ├── useMarkdownFetch.js # Lấy nội dung markdown
│   │   └── useScrollToHash.js  # Điều hướng hash scroll
│   ├── pages/                # Các trang routes
│   │   ├── Home.jsx          # Trang chủ với tất cả blogs
│   │   ├── RepoIndex.jsx     # Danh sách blog repository
│   │   └── RepoReadmePage.jsx # Trang blog riêng lẻ
│   ├── App.jsx               # App component với routes
│   ├── index.css             # Global styles & Tailwind
│   └── main.jsx              # Entry point ứng dụng
├── .github/
│   └── workflows/
│       └── deploy.yml        # GitHub Actions CI/CD
├── index.html                # HTML entry point
├── package.json              # Dependencies
├── vite.config.js            # Cấu hình Vite
├── tailwind.config.js        # Cấu hình Tailwind
├── postcss.config.js         # Cấu hình PostCSS
└── README.md                 # File này

```

  