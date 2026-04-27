# 7ch - Anonymous BBS (Frontend)

7ch 是一个现代化匿名文本论坛（2ch/5ch 风格）的前端 SPA。本目录为前端工程，已实际部署到 Vercel；后端部署在 Render，数据库侧目前采用 `Neon + Supabase` 的双 PostgreSQL 方案。前端保留了完整的 Mock Service 以便在没有后端的情况下独立开发与演示，同时也包含 SSE 更新提示、服务暂停页、限流页、主题切换与一组静态工具/外链页面。

本 README 聚焦 **前端工程** 的架构、运行与对接说明；后端 API 的完整实现细节请查看 `backend_7ch/README.md`。

> 兼容性说明：
> 前端当前已经隐藏日本打工栏目 `/baito/` 和订阅转换工具页 `/tools/convert`，并且直达工具页会重定向回首页。
> 但后端仍保留对应的板块 ID、帖子数据结构以及订阅转换相关 API，以兼容既有数据、受控调用和后续恢复上线。

---

## 项目定位与特性

- 经典文本板体验：板块、帖子列表、楼层、引用（>>123）等核心交互
- 匿名机制展示：每日 ID、Tripcode（绊码）、Sage 下沉等传统 BBS 文化元素
- 现代体验：移动端无限滚动 + 桌面端分页、关注/隐藏帖子、版本更新提示、文档与帮助页
- 国际化：内置 `zh-CN` 与 `ja-JP` 文案资源，支持语言切换
- 主题切换：支持 `light / dark / system`
- 错误兜底：429 限流页、503 服务暂停页与显式跳转
- 静态内容：只读的“常用链接”栏目与独立 changelog 页面
- 可切换数据源：真实 API（Render）与本地 Mock（LocalStorage）一键切换

---

## 线上部署

- **前端**：Vercel（单页应用）
- **后端**：Render（Actix-web）
- **数据库**：Neon + Supabase（后端统一读写路由与回补）

默认线上链接（代码内展示）：
- 前端示例链接：`https://7ch-web.vercel.app`
- 前端运行时代码在 `*.vercel.app` 下的 API 回退地址：`https://backend-7ch.onrender.com`
- `vercel.json` 中的同源 `/api/*` rewrite 目标：`https://backend-7ch.onrender.com/api/*`

> 注：前端可通过环境变量覆盖 API 地址，详见“环境变量”。

---

## 技术栈

- React 19 + TypeScript
- Vite 6
- React Router 7
- Tailwind CSS + tailwindcss-animate
- Radix UI（对话框、弹窗组件）
- i18next + react-i18next（国际化）
- Lucide React（图标）
- class-variance-authority / clsx / tailwind-merge（样式组合）

---

## 目录结构一览

```
.
├── App.tsx                  # 主路由与页面骨架
├── index.tsx                # 应用入口
├── i18n.ts                  # 国际化资源与初始化
├── pages/                   # 页面（Boards/Docs/Help/Tools 等）
├── components/              # UI 与业务组件
│   ├── ThemeSwitcher.tsx    # 主题切换控件
│   └── theme-provider.tsx   # light/dark/system 主题状态
├── services/
│   ├── api.ts               # 真正 API 客户端（fetch）
│   └── mockService.ts       # 本地 Mock（LocalStorage）
├── data/                    # changelog、静态链接等前端内置内容
├── lib/                     # 通用工具与 UI 基础能力
├── scripts/                 # 构建前脚本（如 changelog 生成）
├── types.ts                 # 前后端数据契约
├── index.css                # 全局样式
└── vite.config.ts           # 构建配置
```

---

## 本地运行

### 1. 安装依赖

```
npm install
```

### 2. 启动开发环境

```
npm run dev
```

默认情况下：
- `npm run dev` 启动的是旧 Vite SPA。
- `npm run next:dev` 启动的是当前迁移中的 Next App Router 版本。
- 旧 Vite SPA 下：
  - 如果 `VITE_USE_MOCK=true`，则直接使用本地 Mock（LocalStorage）。
  - 如果 `VITE_USE_MOCK=false`，则连接真实后端（`VITE_API_BASE_URL` 或本地默认回退地址）。

### 3. 构建与预览

``` 
npm run build
npm run build:with-changelog
npm run preview
```

补充说明：
- `npm run build` 只执行 Vite 构建，不再改写 `data/changelog.ts`。
- 如需刷新更新日志页面数据，再手动执行 `npm run update-changelog`，或使用 `npm run build:with-changelog`。

---

## 环境变量

使用 `.env.local` 或部署平台环境变量。推荐以 Next 变量为主，旧的 `VITE_*` 变量只作为兼容旧 SPA 构建的别名保留。

```
NEXT_PUBLIC_SITE_URL=http://localhost:3000
BACKEND_API_BASE_URL=http://localhost:8080
REVALIDATE_SECRET=replace-me

# Legacy SPA compatibility
VITE_API_BASE_URL=http://localhost:8080
VITE_USE_MOCK=false
VITE_FORCE_SERVICE_PAUSED=false
```

规则说明：
- `NEXT_PUBLIC_SITE_URL`：Next metadata / canonical / sitemap 使用的正式站点 URL。生产环境必须设置。
- `BACKEND_API_BASE_URL`：Next Server Components、Route Handlers、sitemap、metadata 获取后端数据时使用。生产环境必须设置。
- `REVALIDATE_SECRET`：`/api/revalidate` webhook 鉴权令牌。生产环境必须设置。
- `VITE_USE_MOCK=true`：强制使用 `services/mockService.ts`（LocalStorage 模拟）。
- `VITE_USE_MOCK=false`：使用真实 API。
- `VITE_FORCE_SERVICE_PAUSED=true`：前端本地强制把真实 API 请求视为“服务暂停”，便于联调 `/service-paused` 页面与错误跳转。
- `VITE_API_BASE_URL` 只供旧 Vite SPA 使用，不再参与 Next App Router 的正式部署配置。
- Next 生产环境下如果缺少 `NEXT_PUBLIC_SITE_URL` 或 `BACKEND_API_BASE_URL`，服务端会直接报错而不是静默回退到错误地址。

---

## API 对接说明（前端视角）

前端的类型契约定义在 `types.ts`，其中包括：
- `Board`：板块信息
- `Thread`：帖子列表项（含 OP 预览）
- `ThreadDetail`：帖子详情（含楼层）
- `CreateThreadRequest / CreatePostRequest`：发帖与回帖请求体
- `SubscriptionConvertRequest / SubscriptionConvertResponse`：订阅转换请求与响应

核心调用在 `services/api.ts`：

- `GET /api/boards`
- `GET /api/threads?boardId=xxx&page=1`
- `GET /api/threads/:threadId`
- `POST /api/threads`
- `POST /api/posts`
- `POST /api/subscription/convert`（当前仅 `clash -> sing-box`，前端已隐藏入口但 API 仍保留）
- `POST /api/subscription/link`（生成安全订阅链接，前端已隐藏入口但 API 仍保留）
- `GET /api/sub?token=...`（通过安全 token 获取转换后订阅内容）

响应字段采用 **camelCase**，与 TypeScript 类型保持一致。

补充：
- 后端 `GET /api/boards` 仍可能返回 `baito`；前端会在 UI 层主动过滤该板块。
- 订阅转换相关客户端方法和类型契约仍保留在前端代码中，但不再对普通用户公开展示。

---

## 页面与路由

当前前端除常规板块页外，还包含一批文档、状态页和只读内容页：

- `/`：首页板块列表
- `/board/:boardId`：板块页
- `/board/:boardId/thread/:threadId`：线程详情页
- `/favorites`：收藏线程页
- `/board/links`：常用链接只读栏目
- `/board/links/thread/:linkId`：静态链接详情页
- `/docs`：技术文档页
- `/help`：使用须知
- `/QA`：常见问题
- `/privacy`：隐私政策
- `/terms`：用户协议
- `/changelog`：更新日志
- `/service-paused`：服务暂停说明页
- `/rate-limited`：限流说明页

补充：
- `Common Links` 是前端内置的静态只读栏目，会和真实后端返回的板块列表合并显示。
- `/baito/` 与 `/tools/convert` 当前已从前端公开导航中移除。
- 直接访问 `/tools/convert` 会被前端重定向回首页；订阅转换 API 本身仍在后端保留。
- `vercel.json` 还保留了旧式 `/test/read.cgi/:boardId/:threadId` 到新线程路由的 301 重定向。

---

## 实时更新与错误处理

- 非 Mock 模式下，前端会通过 `EventSource` 订阅 `GET /api/events`。
- 当前会消费的 SSE 事件包括：
  - `server_version`
  - `thread_created`
  - `post_created`
  - `resync`
- 线程页在 SSE 断开时会退回到轮询刷新。
- 最近一次已确认的服务端版本会存入 `localStorage`，键名：`7ch_server_version`。
- 当真实 API 返回 `429` 时，前端会解析 `Retry-After` 并跳转到 `/rate-limited`。
- 当真实 API 返回 `503` 且错误码为 `database_unavailable`，或启用了 `VITE_FORCE_SERVICE_PAUSED=true` 时，前端会跳转到 `/service-paused`。

---

## Mock Service 说明

`services/mockService.ts` 提供完整的本地数据模拟，适用于：

- 后端未完成时的前端独立开发
- 演示与功能验证
- 离线运行

Mock 的特性：
- 使用 LocalStorage 作为“数据库”
- 模拟每日 ID、Tripcode 与 Sage 行为
- 自动生成本地设备 UUID

注意：Mock 模式下的数据仅存于浏览器本地，清除缓存会丢失。

---

## 主题、国际化与本地偏好

资源定义在 `i18n.ts`，当前内置：
- `zh-CN`
- `ja-JP`

- 语言偏好使用 `localStorage` 持久化，键名：`7ch_lang`
- 主题支持 `light / dark / system`，键名：`7ch_theme`
- 隐藏线程列表键名：`7ch_hidden_threads`
- 关注线程列表键名：`7ch_followed_threads`

前端支持对线程进行：
- 隐藏（不再显示）
- 关注（收藏）

主题系统通过 `ThemeProvider` 挂在应用根部，会同步 HTML 根节点的 `dark` class、`data-theme` 与 `color-scheme`。

---

## 部署补充

`vercel.json` 当前还负责一部分生产行为：

- 为全站附加安全响应头：
  - `Content-Security-Policy: frame-ancestors 'none'; object-src 'none'; base-uri 'self'`
  - `Referrer-Policy: no-referrer`
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- 把同源 `/api/:path*` 转发到 Render
- 把历史路径 `/test/read.cgi/:boardId/:threadId` 重定向到新的 SPA 线程地址

---

## 常见问题

### Q: 为什么前端还保留 Mock？
因为前端在后端开发前就需要完成 UI 与交互验证。Mock 是开发与演示的安全兜底，不影响线上真实 API 使用。

### Q: 线上怎么保证用的是后端？
- 确保 `VITE_USE_MOCK=false`。
- 为 Next 服务端配置 `BACKEND_API_BASE_URL`。
- 实时通知现在通过 Next 的同源 `/api/events` 代理转发到后端，不再要求公开浏览器侧后端地址。
- 配置 `NEXT_PUBLIC_SITE_URL`，保证 canonical、sitemap、Open Graph 指向正式域名。

### Q: `/api/revalidate` 怎么用？
- 设置 `REVALIDATE_SECRET`。
- 以 `Authorization: Bearer <REVALIDATE_SECRET>` 调用。
- 目前支持的事件：
  - `thread_created`：需要 `boardId`
  - `post_created`：需要 `boardId` 和 `threadId`

---

## 贡献与维护

该项目由作者独立完成。欢迎提出 Issue 或 PR，尤其是以下方向：
- 更完整的国际化文案
- UI/交互优化
- 更丰富的管理与审核工具
