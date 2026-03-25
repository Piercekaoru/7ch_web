# 7ch - Anonymous BBS (Frontend)

7ch 是一个现代化匿名文本论坛（2ch/5ch 风格）的前端 SPA。本目录为前端工程，已实际部署到 Vercel；后端部署在 Render，数据库侧目前采用 `Neon + Supabase` 的双 PostgreSQL 方案。前端保留了完整的 Mock Service 以便在没有后端的情况下独立开发与演示。

本 README 聚焦 **前端工程** 的架构、运行与对接说明；后端 API 的完整实现细节请查看 `backend_7ch/README.md`。

---

## 项目定位与特性

- 经典文本板体验：板块、帖子列表、楼层、引用（>>123）等核心交互
- 匿名机制展示：每日 ID、Tripcode（绊码）、Sage 下沉等传统 BBS 文化元素
- 现代体验：移动端无限滚动 + 桌面端分页、关注/隐藏帖子、文档与帮助页
- 国际化：内置 `zh-CN` 与 `ja-JP` 文案资源，支持语言切换
- 可切换数据源：真实 API（Render）与本地 Mock（LocalStorage）一键切换

---

## 线上部署

- **前端**：Vercel（单页应用）
- **后端**：Render（Actix-web）
- **数据库**：Neon + Supabase（后端统一读写路由与回补）

默认线上链接（代码内展示）：
- 前端示例链接：`https://7ch-web.vercel.app`
- 后端默认地址（Vercel 环境自动回退）：`https://backend-7ch.onrender.com`

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
├── services/
│   ├── api.ts               # 真正 API 客户端（fetch）
│   └── mockService.ts       # 本地 Mock（LocalStorage）
├── lib/                     # 通用工具与 UI 基础能力
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
- 如果 `VITE_USE_MOCK=true`，则直接使用本地 Mock（LocalStorage）。
- 如果 `VITE_USE_MOCK=false`，则连接真实后端（`VITE_API_BASE_URL` 或默认回退地址）。

### 3. 构建与预览

```
npm run build
npm run preview
```

---

## 环境变量（前端）

使用 `.env.local` 或 Vercel 环境变量：

```
VITE_API_BASE_URL=http://localhost:8080
VITE_USE_MOCK=false
```

规则说明：
- `VITE_USE_MOCK=true`：强制使用 `services/mockService.ts`（LocalStorage 模拟）。
- `VITE_USE_MOCK=false`：使用真实 API。
- `VITE_API_BASE_URL` 未设置时：
  - 若部署在 `*.vercel.app`，自动回退到 `https://backend-7ch.onrender.com`。
  - 否则回退到 `http://localhost:8080`。

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
- `POST /api/subscription/convert`（当前仅 `clash -> sing-box`）
- `POST /api/subscription/link`（生成安全订阅链接）
- `GET /api/sub?token=...`（通过安全 token 获取转换后订阅内容）

响应字段采用 **camelCase**，与 TypeScript 类型保持一致。

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

## 国际化（i18n）

资源定义在 `i18n.ts`，当前内置：
- `zh-CN`
- `ja-JP`

语言偏好使用 `localStorage` 持久化，键名：`7ch_lang`。

---

## 关注 / 隐藏功能

前端支持对线程进行：
- 隐藏（不再显示）
- 关注（收藏）

数据存储在 `localStorage`：
- `7ch_hidden_threads`
- `7ch_followed_threads`

---

## 常见问题

### Q: 为什么前端还保留 Mock？
因为前端在后端开发前就需要完成 UI 与交互验证。Mock 是开发与演示的安全兜底，不影响线上真实 API 使用。

### Q: 线上怎么保证用的是后端？
- 确保 `VITE_USE_MOCK=false`。
- 在 Vercel 配置 `VITE_API_BASE_URL` 指向 Render 后端地址。

---

## 贡献与维护

该项目由作者独立完成。欢迎提出 Issue 或 PR，尤其是以下方向：
- 更完整的国际化文案
- UI/交互优化
- 更丰富的管理与审核工具
