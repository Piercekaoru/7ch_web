export interface ChangelogEntry {
  date: string;
  title: string;
  version: string;
  changes: string[];
}

export const changelogData: ChangelogEntry[] = [
  {
    "date": "Mar 16, 2026",
    "title": "Update 2026-03-16",
    "version": "build-20260316",
    "changes": [
      "[Frontend] feat: add service paused fallback page"
    ]
  },
  {
    "date": "Mar 10, 2026",
    "title": "Update 2026-03-10",
    "version": "build-20260310",
    "changes": [
      "[Backend] refactor: split sub_converter module"
    ]
  },
  {
    "date": "Feb 23, 2026",
    "title": "Update 2026-02-23",
    "version": "build-20260223",
    "changes": [
      "[Frontend] chore: update frontend changelog and ignore rules",
      "[Frontend] feat: add subscription convert page and secure link flow",
      "[Backend] fix: improve ios profile compatibility and logging",
      "[Backend] feat: add native converter and secure subscription links"
    ]
  },
  {
    "date": "Feb 17, 2026",
    "title": "Update 2026-02-17",
    "version": "build-20260217",
    "changes": [
      "[Frontend] feat(thread): support markdown rendering and code highlighting"
    ]
  },
  {
    "date": "Feb 12, 2026",
    "title": "Update 2026-02-12",
    "version": "build-20260212",
    "changes": [
      "[Backend] upgrade time to 0.3.47 and sync cve report",
      "[Backend] upgrade sqlx to remediate RUSTSEC-2024-0363",
      "[Backend] fix bytes CVE and update cve audit report",
      "[Backend] docs: add english security findings and cve audit report",
      "[Backend] fix trusted proxy IP handling and document high-risk findings",
      "[Backend] refactor backup zig modules and add unit tests"
    ]
  },
  {
    "date": "Feb 11, 2026",
    "title": "Update 2026-02-11",
    "version": "build-20260211",
    "changes": [
      "[Backend] refactor: harden sse limits, proxy ip handling, and input guards",
      "[Backend] chore: rewrite project docs and comments in English"
    ]
  },
  {
    "date": "Feb 10, 2026",
    "title": "Update 2026-02-10",
    "version": "build-20260210",
    "changes": [
      "[Backend] fix: support HEAD healthz checks for uptime monitors",
      "[Backend] feat: add public healthz endpoint for uptime monitoring"
    ]
  },
  {
    "date": "Feb 9, 2026",
    "title": "Update 2026-02-09",
    "version": "build-20260209",
    "changes": [
      "[Backend] fix: add retry for pg_dump backup failures"
    ]
  },
  {
    "date": "Feb 8, 2026",
    "title": "Update 2026-02-08",
    "version": "build-20260208",
    "changes": [
      "[Backend] docs: align backend README with frontend API base logic",
      "[Backend] docs: clarify local vs render port behavior"
    ]
  },
  {
    "date": "Feb 7, 2026",
    "title": "Update 2026-02-07",
    "version": "build-20260207",
    "changes": [
      "[Backend] docs: expand inline comments across repository",
      "[Backend] fix: fallback to db increment when redis view count fails",
      "[Backend] chore: enforce strict clippy denies and clean warnings (#4)",
      "[Backend] Merge remote-tracking branch 'origin/main' into refactor/kaoru-vision",
      "[Backend] chore: enforce strict clippy denies and clean warnings",
      "[Backend] docs: add bilingual comments across rust backend"
    ]
  },
  {
    "date": "Feb 6, 2026",
    "title": "Update 2026-02-06",
    "version": "build-20260206",
    "changes": [
      "[Frontend] docs: expand bilingual comments across frontend",
      "[Frontend] docs: add apache license and bilingual comments",
      "[Backend] chore: tighten cors origins",
      "[Backend] feat: enable redis tls via rustls",
      "[Backend] fix: load dotenv for backup tool",
      "[Backend] docs: document redis distributed lock",
      "[Backend] feat: add redis cache and view count flush"
    ]
  },
  {
    "date": "Feb 5, 2026",
    "title": "Update 2026-02-05",
    "version": "build-20260205",
    "changes": [
      "[Frontend] fix: improve link segmentation in rich text parser",
      "[Frontend] feat: add sse realtime notices",
      "[Backend] docs: add bilingual detailed comments",
      "[Backend] chore: remove backup data and require db url",
      "[Backend] docs: expand backend readme and add license",
      "[Backend] feat: add global sse events and build version"
    ]
  },
  {
    "date": "Feb 4, 2026",
    "title": "Update 2026-02-04",
    "version": "build-20260204",
    "changes": [
      "[Frontend] Integrate changelog update into build process",
      "[Frontend] Update changelog with frontend feature entry",
      "[Frontend] Add changelog feature with page, data, and update script",
      "[Backend] Fix DB URL fallback for Render",
      "[Backend] refactor: reorganize code structure and add backup tool"
    ]
  },
  {
    "date": "Feb 3, 2026",
    "title": "Update 2026-02-03",
    "version": "build-20260203",
    "changes": [
      "[Frontend] Update i18n, PrivacyPolicy and Terms",
      "[Frontend] Update i18n and Docs",
      "[Frontend] Update README",
      "[Frontend] Update App.tsx",
      "[Backend] Add README"
    ]
  },
  {
    "date": "Feb 2, 2026",
    "title": "Update 2026-02-02",
    "version": "build-20260202",
    "changes": [
      "[Frontend] feat: 实现混合分页功能",
      "[Backend] feat: implement profanity filter and update configuration",
      "[Backend] feat: API添加分页支持"
    ]
  },
  {
    "date": "Feb 1, 2026",
    "title": "Update 2026-02-01",
    "version": "build-20260201",
    "changes": [
      "[Frontend] 修复移动端登录对话框的JSX结构问题\\n\\n将移动端登录对话框移到正确的JSX位置，修复因结构错误导致的编译问题。",
      "[Frontend] 修复Tailwind CSS类名错误\\n\\n将z-[100]修正为标准的z-50，避免TypeScript编译错误。",
      "[Frontend] 修复移动端登录对话框显示问题\\n\\n增加z-index层级，添加滚动支持，并修复Link组件的点击处理，确保移动端登录对话框能够正确显示。",
      "[Frontend] 修复移动端下拉菜单中登录按钮的问题\\n\\n在移动端下拉菜单中添加了登录对话框的状态管理，使点击登录按钮时能正确显示弹窗。\\n使用独立的showMobileLoginDialog状态来控制移动端登录对话框的显示。",
      "[Frontend] 移动端头部导航优化\\n\\n将移动端的导航元素（登录、板块列表、我的收藏、语言切换）整合到下拉菜单中，\\n解决元素拥挤的问题。桌面端布局保持不变。",
      "[Frontend] 修复链接域名问题\\n\\n将显示的链接域名从 https://7ch.net/ 修正为实际部署域名 https://7ch-web.vercel.app/",
      "[Frontend] 修复帖子概览中的链接问题\\n\\n将假链接（href=\"#\"）替换为真实的路由链接，使帖子链接可以正确导航到对应页面。",
      "[Frontend] 修复QA页面重复的'A:'问题\\n\\n删除了组件中硬编码的<strong>A:</strong>标签，因为翻译文件中已经包含了'A:'，\\n避免了'A: A:'这样的重复显示问题。"
    ]
  },
  {
    "date": "Jan 31, 2026",
    "title": "Update 2026-01-31",
    "version": "build-20260131",
    "changes": [
      "[Frontend] Update App.tsx and index.html",
      "[Frontend] Update vercel.json",
      "[Frontend] Update frontend: modify App.tsx, ThreadDetail.tsx and add vercel.json",
      "[Frontend] Update frontend components",
      "[Frontend] Update frontend: add DonateModal component and dialog UI",
      "[Backend] feat(logging): add env_logger middleware"
    ]
  },
  {
    "date": "Jan 30, 2026",
    "title": "Update 2026-01-30",
    "version": "build-20260130",
    "changes": [
      "[Frontend] feat(i18n): add internationalization for all static pages",
      "[Frontend] docs(qa): update contact email address",
      "[Frontend] feat(ui): implement client-side search for boards and threads",
      "[Frontend] fix(types): include vite/client for ImportMeta env typing",
      "[Frontend] perf(api): disable caching with no-store for fetch",
      "[Frontend] chore(repo): initial frontend import",
      "[Backend] feat(api): add rate limiting middleware",
      "[Backend] fix(api): expand CORS allowed origins for local preview",
      "[Backend] fix(db): schema-qualify queries and generate UUIDs in app",
      "[Backend] feat(api): bind to PORT and allow vercel CORS",
      "[Backend] chore(repo): initial backend import"
    ]
  },
  {
    "date": "Jan 28, 2026",
    "title": "Update 2026-01-28",
    "version": "build-20260128",
    "changes": [
      "[Frontend] Add routing support and static pages (QA, Docs, Privacy, Terms, Help)",
      "[Frontend] Initial commit: Anonymous BBS application"
    ]
  }
];
