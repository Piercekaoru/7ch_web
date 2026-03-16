import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// 国际化资源集中维护：保持 key 稳定，避免破坏已有翻译。
// Centralized i18n resources: keep keys stable to avoid breaking translations.
const resources = {
      'zh-CN': {
            translation: {
                  "dialog.login.button": "登录/注册",
                  "dialog.login.title": "我们尚未也不会提供传统的账号注册与登录系统。",
                  "dialog.login.description": "为了您的隐私考虑，我们尚未也不会提供传统的账号注册与登录系统。在 7ch，您就是无名氏 (NoName)。详情查看我们的技术文档。",
                  "dialog.login.link_text": "技术文档",
                  "dialog.login.close": "关闭",
                  // Navigation
                  "nav.boards": "板块列表",
                  "nav.home": "首页",
                  "nav.favorites": "我的收藏",
                  "board.catalog": "目录",

                  // Boards
                  "board.all.name": "综合",
                  "board.all.desc": "全站帖子聚合",
                  "board.news.name": "新闻速报+",
                  "board.news.desc": "突发新闻",
                  "board.g.name": "技术",
                  "board.g.desc": "编程、硬件",
                  "board.acg.name": "二次元",
                  "board.acg.desc": "动画、漫画、文化",
                  "board.vip.name": "VIP",
                  "board.vip.desc": "闲聊、杂谈",

                  // Thread & Post
                  "thread.title": "标题",
                  "thread.name": "名字",
                  "thread.email": "E-mail",
                  "thread.content": "正文",
                  "thread.submit": "发送",
                  "thread.reply": "回复",
                  "thread.new": "发布新帖",
                  "thread.return": "返回",
                  "meta.anonymous": "无名氏",
                  "meta.sage": "sage",
                  "meta.loading": "加载中...",
                  "meta.id": "ID",
                  "meta.hide": "隐藏",
                  "meta.show": "显示",
                  "meta.hidden_thread": "帖子已隐藏",
                  "meta.follow": "关注",
                  "meta.following": "已关注",
                  "meta.no_favorites": "暂无收藏。去板块里关注一些帖子吧！",
                  "realtime.new_content": "有新帖子/新回复",
                  "realtime.new_replies": "有新回复",
                  "realtime.refresh_list": "刷新列表",
                  "realtime.load_replies": "加载",
                  "realtime.new_version": "有新更新发布了",
                  "realtime.refresh_page": "刷新页面",
                  "realtime.dismiss": "忽略",
                  "servicePause.badge": "服务暂停",
                  "servicePause.title": "本月访问额度已用尽",
                  "servicePause.lead": "这不是你的网络问题，也不是站点本身发生了不可逆的故障。",
                  "servicePause.body": "只是本月数据库服务的免费额度已经用完，所以现在暂时无法读取帖子内容。",
                  "servicePause.returnTitle": "你刚才访问的是",
                  "servicePause.retry": "重试一次",
                  "servicePause.home": "返回首页",
                  "servicePause.recoveryLabel": "预计恢复时间",
                  "servicePause.recoveryBody": "预计会在下个月月初恢复访问。",
                  "servicePause.windowLabel": "通常可访问的时间",
                  "servicePause.windowValue": "每月 1 日到 10 日",
                  "servicePause.windowBody": "这段时间通常能相对稳定访问；之后可能因为免费额度耗尽而暂停。",
                  "servicePause.noteTitle": "内容并没有丢失",
                  "servicePause.noteBody": "这更像是本月的读取额度暂停，不是帖子被删除。如果你现在刚好撞上月度额度上限，出现这个页面就是预期行为。",
                  "error.required": "内容不能为空",
                  "lang.zh": "中文",
                  "lang.ja": "日本語",

                  // Footer
                  "footer.privacy": "隐私政策",
                  "footer.tech": "技术文档",
                  "footer.terms": "用户协议",
                  "footer.help": "使用须知",
                  "footer.QA": "常见问题",
                  "footer.donate": "捐赠支持",

                  //donate
                  "donate.title": "支持 7ch",
                  "donate.desc": "7ch 不设广告，不卖数据。如果你觉得这里的“猛货”对你有帮助，欢迎通过 Monero 投喂。 你的每一份支持都会变成 Neon 数据库的存储容量和 Render 的并发性能。",
                  "donate.note": "所有捐赠将用于服务器运维费用。",
                  "donate.close": "关闭",

                  // Static Pages (使用模板字符串，自动处理换行)
                  "page.privacy.title": "隐私政策",
                  "page.privacy.content": `本站重视您的隐私。

1. 数据存储：帖子与回复会保存在服务器数据库中，用于提供服务与防滥用。
2. ID机制：每日ID由来源 IP、当日日期（UTC）、板块 ID 与服务器盐值计算，不显示真实 IP。
3. 追踪：本站不使用广告追踪或营销 Cookies，但基础访问日志与托管平台日志可能存在。`,

                  "page.tech.title": "技术文档",
                  "page.tech.content": `7ch 是一个基于 React 19 + TypeScript + Tailwind CSS 构建的现代 BBS 前端架构。

核心特性：
- Mock Service：在前端完整模拟了后端的业务逻辑（ID计算、Sage机制、Tripcode处理）。
- 国际化：基于 i18next 的完整多语言支持。
- 交互：实现了经典的引用预览（Anchor Tooltip）和键盘友好的操作流。`,

                  "page.terms.title": "用户协议",
                  "page.terms.content": `欢迎使用 7ch。

1. 请勿发布违法、侵权、骚扰、人肉或垃圾广告内容。
2. 用户对自己的言论负责，平台保留删除违规内容的权利。
3. 由于匿名机制，不提供自助删帖；严重问题可联系管理员处理。
4. 服务按“现状”提供，不保证不中断或无错误。`,

                  "page.help.title": "使用须知",
                  "page.help.content": `基本操作指南：

1. 【绊码 Tripcode】：名字栏输入 "Name#password" -> 显示 "Name ◆Hash"。
2. 【Sage】：E-mail 栏输入 "sage" 后回帖不会顶帖。
3. 【引用】：使用 >>1 进行引用，悬停可预览。
4. 【ID】：每日 ID 由服务器计算，同板块同日稳定，跨天或换网络变化。`,

                  "page.QA.title": "常见问题",
                  "page.QA.content": `Q: 为什么在中国大陆无法直接访问？
A: 前端托管在 Vercel 的全球边缘网络，部分地区访问可能受限。

Q: 这里的“匿名”是真的吗？
A: 不需要账号，默认匿名。为安全与合规，服务器会记录必要技术信息（如来源 IP）。

Q: 既然不登录，怎么区分“我是我”？
A: 服务器使用来源 IP + 日期（UTC）+ 板块 ID + 私有盐值生成每日 ID，跨天或换网络会变化。

Q: 为什么不公开源码/屏蔽词列表？
A: 出于安全与运营考虑，源码不对外公开；屏蔽词列表也不公开以防被绕过。

Q: 我发错内容了，能删除帖子吗？
A: 不支持自助删除；如涉及违法或侵权，请通过邮箱联系管理员。

Q: 发现违法/侵权内容如何处理？
A: 请发送邮件至 Piercekaoru@proton.me。为了您的安全，建议您同样使用匿名邮箱进行联系。请在邮件中注明 Thread ID 和具体的违规理由，管理员会定期处理。

Q: 在这里发言有法律风险吗？
A: 互联网不是法外之地。虽然本站承诺不建立用户画像，但互联网的基础设施（ISP、电信运营商）依然有迹可循。如果您的言论涉及严重犯罪，执法机构仍可能通过技术手段定位到您。我们不对用户的言论负责，但在法律强制要求下，我们会配合提供仅有的服务器日志信息（如临时 ID 记录）。`,

                  // Docs Page
                  "docs.banner.title": "7ch 技术文档",
                  "docs.banner.subtitle": "架构、数据契约与匿名 ID 机制",
                  "docs.toc.title": "目录",
                  "docs.toc.overview": "项目概览",
                  "docs.toc.architecture": "架构与部署",
                  "docs.toc.data-model": "数据模型与契约",
                  "docs.toc.features": "匿名与核心机制",
                  "docs.toc.i18n": "国际化与本地化",
                  "docs.overview.title": "项目概览",
                  "docs.overview.intro": "是一个面向匿名交流的文本社区，主打低门槛发言与轻量身份识别。",
                  "docs.overview.description": "生产环境采用前后端分离：浏览器 SPA 负责界面与交互，API 服务提供业务能力，Postgres 存储内容。前端部署在 Vercel，后端部署在 Render，数据库位于 Neon。",
                  "docs.overview.transparency": "源码未对外公开，但本文档公开关键机制与数据字段，尤其是每日匿名 ID 的计算方式，便于用户理解与验证。",
                  "docs.overview.frontend": "前端技术栈",
                  "docs.overview.frontend.react": "React 19 + React Router 7（页面路由）",
                  "docs.overview.frontend.typescript": "TypeScript + Vite（类型与构建）",
                  "docs.overview.frontend.tailwind": "Tailwind CSS + Radix UI（样式与组件）",
                  "docs.overview.frontend.i18n": "i18next（多语言）",
                  "docs.overview.concepts": "核心概念",
                  "docs.overview.concepts.no-router": "前后端分离与 REST API",
                  "docs.overview.concepts.mock-api": "真实 API + 可选 Mock（开发/演示）",
                  "docs.overview.concepts.identity": "匿名身份：每日 ID + Tripcode",
                  "docs.overview.concepts.persistence": "服务端持久化 + 客户端偏好缓存",
                  "docs.architecture.title": "架构与部署",
                  "docs.architecture.intro": "系统由浏览器客户端、API 服务与数据库三层组成。客户端仅通过 /api 与服务交互，服务端负责限流、过滤与身份计算后再读写数据库。",
                  "docs.architecture.view-state": "路由与页面结构",
                  "docs.architecture.view-state.desc": "主要页面路径（简化示意）：",
                  "docs.architecture.routes.label": "Routing Map",
                  "docs.architecture.view-state.desc2": "所有业务数据（板块、线程、回帖）都由 API 提供，客户端仅持久化语言、关注与隐藏等偏好。",
                  "docs.data-model.title": "数据模型与契约",
                  "docs.data-model.intro": "客户端看到的核心实体为 Board / Thread / Post。服务端保存更多字段（如 IP、时间戳），但对外仅返回公开字段。",
                  "docs.data-model.entities": "实体",
                  "docs.data-model.entities.board": "板块为固定配置，包含 ID、名称、描述。",
                  "docs.data-model.entities.thread": "线程包含标题、回复数、浏览数、更新时间，以及 OP 预览。",
                  "docs.data-model.entities.post": "帖子为楼层记录，包含显示名、Tripcode、内容、每日 ID 等。",
                  "docs.data-model.note": "对外字段统一为 camelCase。",
                  "docs.data-model.codeLabel": "Public Post Shape",
                  "docs.features.title": "匿名与核心机制",
                  "docs.features.daily-id.title": "1. 每日匿名 ID（Daily ID）",
                  "docs.features.daily-id.intro": "每日 ID 用于区分同一天、同板块内的发言者，同时避免长期追踪。",
                  "docs.features.daily-id.points.input": "输入：客户端来源 IP、当前日期（UTC）、板块 ID、服务器私有盐值。",
                  "docs.features.daily-id.points.hash": "处理：SHA-256 哈希 → Base64 URL Safe（无补位）→ 截断前 8 位。",
                  "docs.features.daily-id.points.output": "输出：形如 ID:A1b2C3d4 的短标识。",
                  "docs.features.daily-id.behavior": "同一 IP 在同一天同一板块 ID 稳定；跨天、换板块或更换网络会变化。共享出口 IP（NAT/校园网）可能显示相同 ID。",
                  "docs.features.daily-id.codeLabel": "Daily ID Algorithm (Pseudo)",
                  "docs.features.daily-id.note": "为防滥用，服务端会保留来源 IP 用于风控，但不会在页面中公开。",
                  "docs.features.tripcode.title": "2. Tripcode（绊码）",
                  "docs.features.tripcode.intro": "名字栏输入 Name#password 会生成 Tripcode，用于“证明同一人”但不需要账号。密码只参与哈希计算，存储的是短哈希片段。",
                  "docs.features.sage.title": "3. Sage 下沉",
                  "docs.features.sage.intro": "Email 字段包含 sage（不区分大小写）时，回帖不会顶帖，只增加回复数。",
                  "docs.features.anchor.title": "4. 引用与预览",
                  "docs.features.anchor.intro": "客户端解析 >>123 引用并提供悬停预览；服务器只存原文，不做特殊解析。",
                  "docs.features.moderation.title": "5. 内容过滤与风控",
                  "docs.features.moderation.intro": "服务端对敏感词进行替换，并进行基础限流以降低刷屏与攻击风险。",
                  "docs.i18n.title": "国际化与本地化",
                  "docs.i18n.intro": "目前提供中文（zh-CN）与日文（ja-JP）。",
                  "docs.i18n.technology": "基于 react-i18next，包含针对日文日期格式的本地化处理：",
                  "docs.i18n.era": "日本纪元日期：如 2025 显示为 R7。",
                  "docs.i18n.weekday": "星期几：显示为 (月)、(火) 等。",
                  "docs.i18n.codeLabel": "Date Format (ja-JP)",

                  // PrivacyPolicy Page
                  "privacy.title": "隐私政策",
                  "privacy.contents": "目录",
                  "privacy.nav.intro": "1. 引言",
                  "privacy.nav.data": "2. 数据收集",
                  "privacy.nav.storage": "3. 数据存储",
                  "privacy.nav.anonymity": "4. 匿名与 ID",
                  "privacy.nav.thirdParty": "5. 第三方服务",
                  "privacy.nav.contact": "6. 联系我们",
                  "privacy.section.intro": "1. 引言",
                  "privacy.intro.text1": "欢迎来到 7ch（\"我们\"、\"我们的\"或\"我们\"）。我们致力于在为匿名交流提供开放平台的同时保护您的隐私。",
                  "privacy.intro.text2": "本隐私政策解释线上服务如何处理信息。7ch 为前后端分离的在线服务，内容存储在服务器数据库中。",
                  "privacy.section.data": "2. 我们收集的信息",
                  "privacy.data.intro": "我们尽量最小化收集，但为运行服务会处理必要信息，包括您主动发布的内容与基础技术数据（如来源 IP）。",
                  "privacy.data.no-personal": "不要求实名信息：不要求手机号、邮箱或社交账号；E-mail 栏仅用于 sage，可留空。",
                  "privacy.data.no-account": "无账号注册：不建立账户系统，您可匿名使用服务。",
                  "privacy.data.voluntary": "您发布的内容将存储在服务器数据库并对公众可见。",
                  "privacy.section.storage": "3. 数据存储与本地偏好",
                  "privacy.storage.intro": "帖子与回复存储在服务器数据库中。浏览器仅保存少量偏好设置。",
                  "privacy.storage.note-title": "重要说明（线上环境）：",
                  "privacy.storage.note": "清除浏览器本地存储不会删除已发布内容；如需处理违法或侵权内容，请通过联系我们的邮箱提交申请。",
                  "privacy.storage.preferences": "我们还在本地存储您的偏好设置，例如：",
                  "privacy.storage.lang": "语言设置 (7ch_lang)",
                  "privacy.storage.hidden": "隐藏的主题列表 (7ch_hidden_threads)",
                  "privacy.storage.followed": "关注的主题列表 (7ch_followed_threads)",
                  "privacy.section.anonymity": "4. 匿名与每日 ID",
                  "privacy.anonymity.intro": "为了在不要求账号的情况下维护秩序并减少刷屏，我们使用每日 ID 系统。",
                  "privacy.anonymity.how": "如何生成 ID：",
                  "privacy.anonymity.desc": "服务器在收到请求时使用来源 IP、当日日期（UTC）、板块 ID 与私有盐值进行哈希计算。",
                  "privacy.anonymity.ensures": "这确保了：",
                  "privacy.anonymity.ensure1": "同一 IP 在同一板块同一天 ID 稳定，并在次日重置。",
                  "privacy.anonymity.ensure2": "不同板块的 ID 不相同。",
                  "privacy.anonymity.ensure3": "ID 仅为显示标识，不会直接暴露真实 IP。",
                  "privacy.section.thirdParty": "5. 第三方服务",
                  "privacy.thirdParty.intro": "我们使用第三方托管与数据库平台提供服务，这些平台可能记录基础访问日志用于安全和稳定性：",
                  "privacy.thirdParty.cdn": "Vercel：前端托管与 CDN。",
                  "privacy.thirdParty.tailwind": "Render / Neon：后端运行与数据库托管。",
                  "privacy.thirdParty.no-tracking": "我们不使用广告追踪或第三方营销像素。",
                  "privacy.section.contact": "6. 联系与权利",
                  "privacy.contact.intro": "由于匿名机制，我们无法验证发帖者身份，原则上不提供自助删帖。若涉及违法或侵权内容，请联系我们进行人工处理。",
                  "privacy.contact.delete": "申请处理时请提供线程或楼层信息与具体理由。",
                  "privacy.contact.tech": "更多机制说明请参阅技术文档。",

                  // Terms Page
                  "terms.title": "用户协议",
                  "terms.contents": "协议",
                  "terms.nav.acceptance": "1. 接受",
                  "terms.nav.conduct": "2. 用户行为",
                  "terms.nav.content": "3. 内容与责任",
                  "terms.nav.moderation": "4. 审核政策",
                  "terms.nav.disclaimer": "5. 免责声明",
                  "terms.section.acceptance": "1. 接受条款",
                  "terms.acceptance.text1": "通过访问和使用 7ch（\"服务\"），您接受并同意受本协议的条款和规定的约束。此外，在使用本服务时，您应遵守适用于此类服务的任何发布的指南或规则。",
                  "terms.acceptance.text2": "如果您不同意遵守上述内容，请不要使用本服务。",
                  "terms.section.conduct": "2. 用户行为",
                  "terms.conduct.intro": "您同意您对通过服务发布、传输或分享的任何内容承担全部责任。您同意不要使用服务来：",
                  "terms.conduct.illegal": "非法内容：发布任何违反适用的当地、州、国家或国际法律的内容（例如，儿童剥削、非法贸易）。",
                  "terms.conduct.harassment": "骚扰：跟踪、骚扰、威胁或人肉搜索（发布其他人的私人信息）。",
                  "terms.conduct.spam": "垃圾信息：发布未经请求或未经授权的广告、促销材料、\"垃圾邮件\"或\"连锁信\"。",
                  "terms.conduct.malware": "恶意软件：上传或链接到旨在中断、破坏或限制任何软件或硬件功能的软件病毒或任何其他计算机代码。",
                  "terms.section.content": "3. 内容所有权与责任",
                  "terms.content.anonymity": "匿名与责任：匿名并不等于免责，您承认并承担对自己言论的法律责任。服务仅提供发布渠道。",
                  "terms.content.no-screening": "无预审：我们本身不会在发布之前查看或批准内容。但是，我们保留（但不承担义务）删除任何违反这些条款的内容的权利。",
                  "terms.content.persistence": "数据持久化：帖子与回复会存储在服务器数据库中。清除本地缓存不会删除已发布内容。",
                  "terms.section.moderation": "4. 审核政策",
                  "terms.moderation.intro": "7ch 管理员保留以下权利：",
                  "terms.moderation.right1": "随时以任何理由删除任何主题或帖子，有或无通知。",
                  "terms.moderation.right2": "在必要时限制访问或采取技术措施以保护服务。",
                  "terms.moderation.right3": "指定志愿者管理员管理特定板块。",
                  "terms.moderation.note": "此平台上的“言论自由”是社区原则而非绝对权利。破坏社区体验的内容可能被移除。",
                  "terms.section.disclaimer": "5. 免责声明",
                  "terms.disclaimer.warning": "请仔细阅读",
                  "terms.disclaimer.text1": "服务按\"原样\"和\"可用\"提供，不提供任何明示或暗示的保证。",
                  "terms.disclaimer.text2": "我们不保证服务将不中断、安全或无错误。您理解并同意，您通过使用服务自行下载或以其他方式获取材料或数据的风险由您自己承担。",

                  // Help Page
                  "help.banner.title": "使用指南",
                  "help.banner.subtitle": "如何有效使用 7ch",
                  "help.toc.title": "目录",
                  "help.toc.basics": "1. 基础",
                  "help.toc.tripcodes": "2. 绰号",
                  "help.toc.sage": "3. Sage 功能",
                  "help.toc.anchors": "4. 锚点与引用",
                  "help.toc.ids": "5. ID 系统",
                  "help.section.basics": "1. 基础",
                  "help.basics.intro": "7ch 是一个匿名文本社区，帖子存储在服务器数据库中。您无需注册账号即可发布。导航依赖于简单的层次结构：板块包含主题，主题包含帖子。",
                  "help.basics.posting": "发布：任何人都可以创建主题（开始讨论）或回复现有主题。",
                  "help.basics.anonymity": "匿名：默认情况下，您的名称显示为\"Anonymous\"（或\"名無しさん\"），并显示每日 ID。",
                  "help.section.tripcodes": "2. 绰号（身份）",
                  "help.tripcodes.intro": "如果您需要在多个帖子中证明自己的身份而无需注册，请使用绰号。",
                  "help.tripcodes.how": "如何使用：",
                  "help.tripcodes.how-desc": "在名字字段中，输入：",
                  "help.tripcodes.example-desc": "示例：输入 Alice#secret123 将显示为 Alice ◆AbC123x。",
                  "help.tripcodes.note": "密码（# 之后的部分）不会被保存，仅用于生成哈希；他人可验证 ◆ 后的结果是否一致。",
                  "help.section.sage": "3. Sage 功能",
                  "help.sage.intro": "默认情况下，回复主题会将其\"顶\"到板块索引的顶部，增加其可见性。",
                  "help.sage.how": "如果您想在不顶起主题的情况下回复（例如，进行小更正或避免顶起恶搞主题），请在 E-mail 字段中输入 sage。",
                  "help.sage.normal": "普通帖子：主题更新时间更改 -> 移动到顶部。",
                  "help.sage.sage-post": "Sage 帖子：主题更新时间不会更改 -> 保持在原位。",
                  "help.section.anchors": "4. 锚点与引用",
                  "help.anchors.intro": "要回复特定帖子，请使用 >> 符号后跟帖子编号。",
                  "help.anchors.input": "输入",
                  "help.anchors.result": "结果",
                  "help.anchors.hover": "在 7ch 上，悬停在蓝色锚点链接（如 >>15）上将显示该帖子的弹出预览。单击它通常会添加反向链接或跳转到帖子。",
                  "help.section.ids": "5. 每日 ID 系统",
                  "help.ids.intro": "我们不使用用户名，而是使用每日 ID 来识别同一天、同板块内的发言者。ID 由服务器基于来源 IP、日期（UTC）、板块 ID 与盐值计算。",
                  "help.ids.example": "示例 ID：",
                  "help.ids.scope": "范围：同一 IP、同一板块、同一天稳定。",
                  "help.ids.reset": "重置：ID 每天在午夜（UTC）更改。",
                  "help.ids.privacy": "隐私：ID 不展示真实 IP，但服务器会为安全与合规保留必要日志。",

                  // QA Page
                  "qa.title": "Q&A / 常见问题",
                  "qa.subtitle": "问题与答案",
                  "qa.toc.title": "目录",
                  "qa.toc.access": "1. 访问问题",
                  "qa.toc.anonymity": "2. 关于匿名",
                  "qa.toc.identity": "3. 身份区分",
                  "qa.toc.privacy": "4. 隐私信任",
                  "qa.toc.opensource": "5. 源码与过滤",
                  "qa.toc.deletion": "6. 删帖政策",
                  "qa.toc.report": "7. 举报投诉",
                  "qa.toc.legal": "8. 法律风险",
                  "qa.q1.question": "Q: 为什么在中国大陆无法直接访问？",
                  "qa.q1.answer1": "A: 本站前端托管于 Vercel 的全球边缘网络。",
                  "qa.q1.answer2": "由于不同地区网络环境差异，部分地区访问可能受限。",
                  "qa.q2.question": "Q: 这里的\"匿名\"是真的吗？",
                  "qa.q2.answer1": "A: 我们不要求账号，默认匿名。",
                  "qa.q2.answer2": "为安全与合规，服务器会记录必要技术信息（如来源 IP），但不会公开。",
                  "qa.q3.question": "Q: 既然不登录，怎么区分\"我是我\"？",
                  "qa.q3.answer1": "A: 服务器使用来源 IP、日期（UTC）、板块 ID 与私有盐值生成每日 ID。",
                  "qa.q3.note": "注意：",
                  "qa.q3.note-text": "跨天、换板块或更换网络环境都会导致 ID 变化。在 7ch，身份是流动的。",
                  "qa.q4.question": "Q: 我凭什么相信你们不窃取隐私？",
                  "qa.q4.answer1": "A: 我们坚持数据最小化并公开关键机制。",
                  "qa.q4.answer2": "不使用广告追踪或营销像素，具体规则可参见隐私政策与技术文档。",
                  "qa.q5.question": "Q: 为什么不公开源码或屏蔽词列表？",
                  "qa.q5.answer1": "A: 出于安全与运营考虑，源码不对外公开。",
                  "qa.q5.answer2": "屏蔽词列表也不公开以避免被绕过，我们公开机制而非具体规则。",
                  "qa.q6.question": "Q: 我发错内容了，能删除帖子吗？",
                  "qa.q6.answer1": "A: 不支持自助删除。",
                  "qa.q6.answer2": "由于采用匿名机制，系统难以验证\"你是发布者\"，因此不提供删除按钮。（涉及违法/侵权请联系管理员。）",
                  "qa.q7.question": "Q: 发现违法/侵权内容如何处理？",
                  "qa.q7.answer1": "A: 请发送邮件至",
                  "qa.q7.answer2": "为了您的安全，建议您同样使用匿名邮箱进行联系。请在邮件中注明 Thread ID 和具体的违规理由，管理员会定期处理。",
                  "qa.q8.question": "Q: 在这里发言有法律风险吗？",
                  "qa.q8.answer1": "A: 互联网不是法外之地。",
                  "qa.q8.answer2": "我们不做用户画像，但互联网基础设施仍可能留下痕迹。如涉及严重违法，执法机构可依法请求信息。",
                  "qa.q8.answer3": "在法律强制要求下，我们会配合提供必要的服务器日志信息。",

                  // Pagination
                  "pagination.prev": "上一页",
                  "pagination.next": "下一页",
                  "pagination.info": "第 {{current}} 页，共 {{total}} 页",
                  "pagination.load_more": "加载更多",
                  "pagination.no_more": "没有更多内容了",
            }
      },
      'ja-JP': {
            translation: {
                  "dialog.login.button": "ログイン/登録",
                  "dialog.login.title": "当サイトは従来のアカウント登録とログインシステムを提供していませんし、今後も提供しません。",
                  "dialog.login.description": "プライバシー保護のため、当サイトは従来のアカウント登録とログインシステムを提供していませんし、今後も提供しません。7chでは、あなたは名無しさん (NoName) です。詳細は技術ドキュメントをご覧ください。",
                  "dialog.login.link_text": "技術ドキュメント",
                  "dialog.login.close": "閉じる",
                  // Navigation
                  "nav.boards": "掲示板一覧",
                  "nav.home": "ホーム",
                  "nav.favorites": "お気に入り",
                  "board.catalog": "カタログ",

                  // Boards
                  "board.all.name": "総合",
                  "board.all.desc": "全板スレッド一覧",
                  "board.news.name": "ニュース速報+",
                  "board.news.desc": "ニュース",
                  "board.g.name": "技術",
                  "board.g.desc": "プログラミング、ハードウェア",
                  "board.acg.name": "二次元",
                  "board.acg.desc": "アニメ、マンガ、文化",
                  "board.vip.name": "VIP",
                  "board.vip.desc": "雑談",

                  // Thread & Post
                  "thread.title": "タイトル",
                  "thread.name": "名前",
                  "thread.email": "E-mail",
                  "thread.content": "本文",
                  "thread.submit": "書き込む",
                  "thread.reply": "返信",
                  "thread.new": "スレッド作成",
                  "thread.return": "戻る",
                  "meta.anonymous": "名無しさん",
                  "meta.sage": "sage",
                  "meta.loading": "読込中...",
                  "meta.id": "ID",
                  "meta.hide": "非表示",
                  "meta.show": "表示",
                  "meta.hidden_thread": "非表示のスレッド",
                  "meta.follow": "フォロー",
                  "meta.following": "フォロー中",
                  "meta.no_favorites": "お気に入りはまだありません。",
                  "realtime.new_content": "新しいスレッド/返信があります",
                  "realtime.new_replies": "新しい返信があります",
                  "realtime.refresh_list": "一覧を更新",
                  "realtime.load_replies": "読み込む",
                  "realtime.new_version": "新しい更新があります",
                  "realtime.refresh_page": "ページを更新",
                  "realtime.dismiss": "閉じる",
                  "servicePause.badge": "サービス一時停止",
                  "servicePause.title": "今月のアクセス枠を使い切りました",
                  "servicePause.lead": "これはあなたの回線の問題でも、サイト自体が致命的に壊れたわけでもありません。",
                  "servicePause.body": "今月分のデータベース無料枠を使い切ったため、現在はスレッドを読み込めない状態です。",
                  "servicePause.returnTitle": "直前に開いていたページ",
                  "servicePause.retry": "もう一度試す",
                  "servicePause.home": "トップへ戻る",
                  "servicePause.recoveryLabel": "復旧見込み",
                  "servicePause.recoveryBody": "来月の月初ごろに再びアクセスできる見込みです。",
                  "servicePause.windowLabel": "比較的安定して見られる期間",
                  "servicePause.windowValue": "毎月 1 日から 10 日ごろ",
                  "servicePause.windowBody": "この期間は比較的安定してアクセスできますが、その後は無料枠の上限で止まる可能性があります。",
                  "servicePause.noteTitle": "投稿内容が消えたわけではありません",
                  "servicePause.noteBody": "今月分の読み取り枠が止まっているだけで、スレッド自体が削除されたわけではありません。月間上限に当たったタイミングでは、このページが正常な案内になります。",
                  "error.required": "本文を入力してください",
                  "lang.zh": "中文",
                  "lang.ja": "日本語",

                  // Footer
                  "footer.privacy": "プライバシーポリシー",
                  "footer.tech": "技術ドキュメント",
                  "footer.terms": "利用規約",
                  "footer.help": "使い方",
                  "footer.QA": "よくある質問",
                  "footer.donate": "寄付で支援",

                  //donate
                  "donate.title": "7ch を支援する",
                  "donate.desc": "7ch の開発と運営を支援するために、寄付を検討してください。あなたのサポートは、匿名でオープンなインターネットスペースを維持するのに役立ちます。",
                  "donate.note": "すべての寄付はサーバーの運営費に使用されます。",
                  "donate.close": "閉じる",

                  // Static Pages (使用模板字符串)
                  "page.privacy.title": "プライバシーポリシー",
                  "page.privacy.content": `当サイトはプライバシーを重視しています。

1. データ保存：投稿と返信はサービス提供のためサーバーのデータベースに保存されます。
2. ID 仕組み：Daily ID は送信元 IP、UTC 日付、板 ID、サーバーの秘密ソルトから計算され、実際の IP は表示されません。
3. 追跡：広告トラッカーは使用しませんが、基本的なアクセスログやホスティング側のログが残る場合があります。`,

                  "page.tech.title": "技術ドキュメント",
                  "page.tech.content": `7chは React 19 + TypeScript + Tailwind CSS で構築されたモダンな掲示板アーキテクチャです。

主な機能：
- Mock Service：バックエンドロジック（ID計算、Sage、トリップ）をフロントエンドで完全シミュレート。
- 国際化：i18nextによる完全な多言語対応。
- UI/UX：アンカーポップアップやレスポンシブデザインを実装。`,

                  "page.terms.title": "利用規約",
                  "page.terms.content": `7chへようこそ。

1. 違法・権利侵害・嫌がらせ・スパム等の投稿は禁止です。
2. 発言の責任は利用者にあります。運営は違反コンテンツを削除する権利を持ちます。
3. 匿名性のため自己削除は提供しません。重大な問題は管理者へ連絡してください。
4. サービスは現状有姿で提供され、停止やエラーがないことを保証しません。`,

                  "page.help.title": "使い方",
                  "page.help.content": `基本ガイド：

1. 【トリップ】：名前に "名前#パスワード" と入力すると "名前 ◆Hash" と表示されます。
2. 【sage】：E-mail欄に "sage" と入力するとスレッドを上げません。
3. 【アンカー】：>>1 で引用、ホバーでプレビュー。
4. 【ID】：Daily ID はサーバーで計算され、同一板・同一日で安定、日付や回線で変化します。`,

                  "page.QA.title": "よくある質問",
                  "page.QA.content": `Q: 中国大陸から直接アクセスできないのはなぜですか？
A: フロントエンドは Vercel のグローバルエッジで配信されており、地域によってはアクセスが制限される場合があります。

Q: ここでの「匿名」は本当ですか？
A: アカウント不要で匿名です。安全と運用のため、サーバーは必要な技術情報（例: IP）を記録します。

Q: ログインしないなら、「私が私」であることをどう区別するのですか？
A: サーバーが送信元 IP、UTC 日付、板 ID、秘密ソルトから Daily ID を計算します。日付変更や回線変更で ID が変わります。

Q: なぜソースやNGワードリストを公開しないのですか？
A: 安全と運用上の理由からソースは非公開です。NGワードリストも回避を防ぐため非公開です。

Q: 間違えて投稿しました。削除できますか？
A: 自助削除はできません。違法/侵害の場合は管理者へご連絡ください。

Q: 違法・侵害コンテンツを発見したらどうすればいいですか？
A: Piercekaoru@proton.me までメールを送ってください。安全のため、匿名メールでの連絡をお勧めします。メールにスレッドIDと具体的な違反理由を明記してください。管理者が定期的に処理します。

Q: ここで発言しても法的リスクはありませんか？
A: インターネットは法外の地ではありません。本サイトはユーザープロファイリングを行わないことを約束していますが、インターネットインフラ（ISP、通信キャリア）は依然として追跡可能です。発言が深刻な犯罪に関わる場合、法執行機関は技術的手段で特定できる可能性があります。ユーザーの発言に対して責任は負いませんが、法的強制要求がある場合、サーバーログ（一時ID記録など）を提供します。`,

                  // Docs Page
                  "docs.banner.title": "7ch 技術ドキュメント",
                  "docs.banner.subtitle": "アーキテクチャ、データ契約、匿名 ID の仕組み",
                  "docs.toc.title": "目次",
                  "docs.toc.overview": "プロジェクト概要",
                  "docs.toc.architecture": "アーキテクチャとデプロイ",
                  "docs.toc.data-model": "データモデルと契約",
                  "docs.toc.features": "匿名性と主要メカニズム",
                  "docs.toc.i18n": "国際化とローカライズ",
                  "docs.overview.title": "プロジェクト概要",
                  "docs.overview.intro": "匿名交流のためのテキストコミュニティで、低い参入障壁と軽量なアイデンティティを重視しています。",
                  "docs.overview.description": "本番環境はフロントエンドとバックエンドを分離した構成です。ブラウザ SPA が UI と操作を担い、API サービスが機能を提供し、Postgres が内容を保存します。フロントは Vercel、バックエンドは Render、DB は Neon に配置されています。",
                  "docs.overview.transparency": "ソースコードは公開していませんが、本ドキュメントでは主要メカニズムと公開データ項目、特に Daily ID の算出方法を説明します。",
                  "docs.overview.frontend": "フロントエンドスタック",
                  "docs.overview.frontend.react": "React 19 + React Router 7（ルーティング）",
                  "docs.overview.frontend.typescript": "TypeScript + Vite（型とビルド）",
                  "docs.overview.frontend.tailwind": "Tailwind CSS + Radix UI（スタイルとコンポーネント）",
                  "docs.overview.frontend.i18n": "i18next（多言語）",
                  "docs.overview.concepts": "主要概念",
                  "docs.overview.concepts.no-router": "フロント/バック分離と REST API",
                  "docs.overview.concepts.mock-api": "実 API + 任意の Mock（開発/デモ）",
                  "docs.overview.concepts.identity": "匿名アイデンティティ：Daily ID + Tripcode",
                  "docs.overview.concepts.persistence": "サーバー永続化 + クライアント設定キャッシュ",
                  "docs.architecture.title": "アーキテクチャとデプロイ",
                  "docs.architecture.intro": "システムはブラウザクライアント、API サービス、データベースの三層で構成されます。クライアントは /api を通じてのみ通信し、サーバー側でレート制限・フィルタリング・ID 計算を行った上で保存されます。",
                  "docs.architecture.view-state": "ルーティングとページ構成",
                  "docs.architecture.view-state.desc": "主なページパス（簡略）：",
                  "docs.architecture.routes.label": "Routing Map",
                  "docs.architecture.view-state.desc2": "板・スレッド・投稿などのデータはすべて API から取得され、クライアントは言語設定やフォロー/非表示などの好みだけを保存します。",
                  "docs.data-model.title": "データモデルと契約",
                  "docs.data-model.intro": "クライアントが扱う主要エンティティは Board / Thread / Post です。サーバー側には IP やタイムスタンプ等の内部フィールドがありますが、公開 API では必要なフィールドのみ返します。",
                  "docs.data-model.entities": "エンティティ",
                  "docs.data-model.entities.board": "板は固定定義で、ID・名称・説明を持ちます。",
                  "docs.data-model.entities.thread": "スレッドはタイトル、返信数、閲覧数、更新日時、OP プレビューを含みます。",
                  "docs.data-model.entities.post": "投稿は表示名、Tripcode、本文、Daily ID などを持つ各階層レコードです。",
                  "docs.data-model.note": "公開フィールドは camelCase で統一されています。",
                  "docs.data-model.codeLabel": "Public Post Shape",
                  "docs.features.title": "匿名性と主要メカニズム",
                  "docs.features.daily-id.title": "1. Daily ID（毎日変わる匿名 ID）",
                  "docs.features.daily-id.intro": "Daily ID は同一板・同一日における発言者の識別に使われ、長期的な追跡を避けるため毎日変化します。",
                  "docs.features.daily-id.points.input": "入力：クライアントの送信元 IP、現在日付（UTC）、板 ID、サーバーの秘密ソルト。",
                  "docs.features.daily-id.points.hash": "処理：SHA-256 ハッシュ → Base64 URL Safe（パディングなし）→ 先頭 8 文字を使用。",
                  "docs.features.daily-id.points.output": "出力：ID:A1b2C3d4 のような短い識別子。",
                  "docs.features.daily-id.behavior": "同一 IP は同一板・同一日で安定。日付変更、板の変更、ネットワーク変更で ID は変化します。共有回線（NAT 等）では同じ ID になる場合があります。",
                  "docs.features.daily-id.codeLabel": "Daily ID Algorithm (Pseudo)",
                  "docs.features.daily-id.note": "悪用対策のため送信元 IP はサーバー側で保持しますが、ページ上には公開しません。",
                  "docs.features.tripcode.title": "2. Tripcode（トリップ）",
                  "docs.features.tripcode.intro": "名前欄に Name#password を入力すると Tripcode が生成され、同一人物であることを示せます。パスワードは保存せず、短いハッシュ片のみを保持します。",
                  "docs.features.sage.title": "3. Sage（下げ）",
                  "docs.features.sage.intro": "Email 欄に sage を含めると（大文字小文字を区別しません）、返信してもスレッドを上げません。",
                  "docs.features.anchor.title": "4. 引用とプレビュー",
                  "docs.features.anchor.intro": "クライアントが >>123 の引用を解析し、ホバー時にプレビューを表示します。サーバーは本文をそのまま保存します。",
                  "docs.features.moderation.title": "5. フィルタリングと風紀対策",
                  "docs.features.moderation.intro": "サーバー側で NG ワードの置換と基本的なレート制限を行い、スパムや攻撃を抑制します。",
                  "docs.i18n.title": "国際化とローカライズ",
                  "docs.i18n.intro": "現在は中国語（zh-CN）と日本語（ja-JP）に対応しています。",
                  "docs.i18n.technology": "react-i18next を使用し、日本語の日時表記を最適化しています：",
                  "docs.i18n.era": "和暦日付：例として 2025 は R7 と表示。",
                  "docs.i18n.weekday": "曜日： (月)、(火) など。",
                  "docs.i18n.codeLabel": "Date Format (ja-JP)",

                  // PrivacyPolicy Page
                  "privacy.title": "プライバシーポリシー",
                  "privacy.contents": "目次",
                  "privacy.nav.intro": "1. はじめに",
                  "privacy.nav.data": "2. データ収集",
                  "privacy.nav.storage": "3. データ保存",
                  "privacy.nav.anonymity": "4. 匿名性とID",
                  "privacy.nav.thirdParty": "5. 第三者サービス",
                  "privacy.nav.contact": "6. お問い合わせ",
                  "privacy.section.intro": "1. はじめに",
                  "privacy.intro.text1": "7ch（「当社」）へようこそ。当社は、匿名コミュニケーションのオープンプラットフォームを提供しながら、プライバシーを保護することにコミットしています。",
                  "privacy.intro.text2": "このポリシーはオンラインサービスにおける情報の取り扱いを説明します。7ch はフロント/バック分離のオンラインサービスで、内容はサーバーのデータベースに保存されます。",
                  "privacy.section.data": "2. 収集する情報",
                  "privacy.data.intro": "最小限の収集を心がけていますが、サービス運用のため投稿内容と必要な技術情報（例: 送信元 IP）を処理します。",
                  "privacy.data.no-personal": "実名情報は要求しません。電話番号・メール・SNS は不要です。E-mail 欄は sage 用で空欄可。",
                  "privacy.data.no-account": "アカウント登録なし。匿名で利用できます。",
                  "privacy.data.voluntary": "投稿内容はサーバーに保存され公開されます。",
                  "privacy.section.storage": "3. データ保存とローカル設定",
                  "privacy.storage.intro": "投稿と返信はサーバー DB に保存されます。ブラウザには一部の設定のみ保存します。",
                  "privacy.storage.note-title": "オンライン環境の重要事項：",
                  "privacy.storage.note": "ブラウザのローカルデータ削除では投稿は消えません。違法/侵害の対応はお問い合わせください。",
                  "privacy.storage.preferences": "以下の設定もローカルに保存されます：",
                  "privacy.storage.lang": "言語設定 (7ch_lang)",
                  "privacy.storage.hidden": "非表示のスレッドリスト (7ch_hidden_threads)",
                  "privacy.storage.followed": "フォロー中のスレッドリスト (7ch_followed_threads)",
                  "privacy.section.anonymity": "4. 匿名性とDaily ID",
                  "privacy.anonymity.intro": "アカウント不要で秩序を維持するため、Daily ID システムを使用しています。",
                  "privacy.anonymity.how": "IDの生成方法：",
                  "privacy.anonymity.desc": "サーバーが送信元 IP、UTC 日付、板 ID、秘密ソルトをハッシュ化して計算します。",
                  "privacy.anonymity.ensures": "これにより：",
                  "privacy.anonymity.ensure1": "同一 IP・同一板・同一日で安定し、翌日に更新されます。",
                  "privacy.anonymity.ensure2": "異なるボードではIDが異なります。",
                  "privacy.anonymity.ensure3": "IDは表示用であり実際のIPを直接示しません。",
                  "privacy.section.thirdParty": "5. 第三者サービス",
                  "privacy.thirdParty.intro": "サービス提供のため第三者のホスティング/DB を利用し、基本的なアクセスログが記録される場合があります：",
                  "privacy.thirdParty.cdn": "Vercel：フロントエンドと CDN。",
                  "privacy.thirdParty.tailwind": "Render / Neon：バックエンド運用と DB。",
                  "privacy.thirdParty.no-tracking": "広告トラッカーやマーケティングピクセルは使用しません。",
                  "privacy.section.contact": "6. お問い合わせと権利",
                  "privacy.contact.intro": "匿名性のため投稿者の本人確認ができず、原則として自己削除は提供しません。違法/侵害はお問い合わせください。",
                  "privacy.contact.delete": "申請時はスレッド/レス番号と理由を提示してください。",
                  "privacy.contact.tech": "詳細は技術ドキュメントを参照してください。",

                  // Terms Page
                  "terms.title": "利用規約",
                  "terms.contents": "同意事項",
                  "terms.nav.acceptance": "1. 同意",
                  "terms.nav.conduct": "2. ユーザーの行動",
                  "terms.nav.content": "3. コンテンツと責任",
                  "terms.nav.moderation": "4. モデレーションポリシー",
                  "terms.nav.disclaimer": "5. 免責事項",
                  "terms.section.acceptance": "1. 利用規約の同意",
                  "terms.acceptance.text1": "7ch（「サービス」）にアクセスして使用することにより、この契約の条項および規定に拘束されることに同意し、受諾するものとします。さらに、サービスを使用する際、適用されるガイドラインや規則を遵守するものとします。",
                  "terms.acceptance.text2": "上記に同意しない場合は、サービスを使用しないでください。",
                  "terms.section.conduct": "2. ユーザーの行動",
                  "terms.conduct.intro": "サービスを通じて投稿、送信、または共有するコンテンツについて、全責任を負うことに同意します。以下の目的でサービスを使用しないことに同意します：",
                  "terms.conduct.illegal": "違法なコンテンツ：適用される現地、州、国、または国際法に違反するコンテンツ（例：児童搾取、違法取引）を投稿する。",
                  "terms.conduct.harassment": "ハラスメント：ストーキング、嫌がらせ、脅迫、または人肉検索（他者の個人情報の公開）を行う。",
                  "terms.conduct.spam": "スパム：未承諾または無許可の広告、プロモーション素材、「ジャンクメール」、または「チェーンレター」を投稿する。",
                  "terms.conduct.malware": "マルウェア：ソフトウェアまたはハードウェアの機能を中断、破壊、または制限するように設計されたソフトウェアウイルスまたはその他のコンピュータコードをアップロードまたはリンクする。",
                  "terms.section.content": "3. コンテンツの所有権と責任",
                  "terms.content.anonymity": "匿名性と責任：匿名であっても免責ではありません。自身の発言に対する法的責任を負うことを認めます。サービスは投稿のための媒体です。",
                  "terms.content.no-screening": "事前チェックなし：投稿前にコンテンツを表示または承認することはありません。ただし、これらの条項に違反するコンテンツを削除する権利を留保します（義務は負いません）。",
                  "terms.content.persistence": "データの永続化：投稿と返信はサーバーのデータベースに保存されます。ローカルデータ削除で投稿は消えません。",
                  "terms.section.moderation": "4. モデレーションポリシー",
                  "terms.moderation.intro": "7ch管理者は以下の権利を留保します：",
                  "terms.moderation.right1": "事前の通知ありまたはなしで、いかなる理由でもスレッドまたは投稿を削除する。",
                  "terms.moderation.right2": "必要に応じてアクセス制限や技術的な対策を行う。",
                  "terms.moderation.right3": "特定のボードを管理するためにボランティアモデレーターを指名する。",
                  "terms.moderation.note": "このプラットフォームでの「言論の自由」は原則であり、絶対的な権利ではありません。コミュニティを損なう行為は削除されます。",
                  "terms.section.disclaimer": "5. 免責事項",
                  "terms.disclaimer.warning": "注意深くお読みください",
                  "terms.disclaimer.text1": "サービスは「現状のまま」および「利用可能な状態で」提供され、いかなる明示または黙示の保証もありません。",
                  "terms.disclaimer.text2": "サービスが中断なし、安全、またはエラーなしであることを保証しません。サービスを使用して、ご自身の裁量と責任で素材またはデータをダウンロードまたは取得することを理解し、同意するものとします。",

                  // Help Page
                  "help.banner.title": "ユーザーガイド",
                  "help.banner.subtitle": "7chを効果的に使用する方法",
                  "help.toc.title": "目次",
                  "help.toc.basics": "1. 基礎",
                  "help.toc.tripcodes": "2. トリップコード",
                  "help.toc.sage": "3. Sage機能",
                  "help.toc.anchors": "4. アンカーと引用",
                  "help.toc.ids": "5. IDシステム",
                  "help.section.basics": "1. 基礎",
                  "help.basics.intro": "7chは匿名テキストコミュニティです。投稿はサーバーDBに保存されます。アカウント登録なしで投稿できます。ナビゲーションはシンプルな階層構造です。",
                  "help.basics.posting": "投稿：誰でもスレッドを作成（議論を開始）または既存のスレッドに返信できます。",
                  "help.basics.anonymity": "匿名：デフォルトでは「Anonymous」（または「名無しさん」）と表示され、Daily ID が付きます。",
                  "help.section.tripcodes": "2. トリップコード（身元）",
                  "help.tripcodes.intro": "登録なしで複数の投稿で身元を証明する必要がある場合は、トリップコードを使用してください。",
                  "help.tripcodes.how": "使用方法：",
                  "help.tripcodes.how-desc": "名前フィールドに、次のように入力します：",
                  "help.tripcodes.example-desc": "例：Alice#secret123 と入力すると、Alice ◆AbC123x と表示されます。",
                  "help.tripcodes.note": "パスワード（#以降）は保存されずハッシュ生成にのみ使われます。◆以降が同じなら同一人物の目印になります。",
                  "help.section.sage": "3. Sage機能",
                  "help.sage.intro": "デフォルトでは、スレッドに返信すると、スレッドがボードインデックスのトップに「上がり」、その可視性が高まります。",
                  "help.sage.how": "スレッドを上げずに返信したい場合（例：小さな修正や荒らしスレッドを上げないため）、Eメールフィールドに sage と入力してください。",
                  "help.sage.normal": "通常の投稿：スレッドの更新時間が変更 -> トップに移動。",
                  "help.sage.sage-post": "Sage投稿：スレッドの更新時間は変更されない -> 同じ位置にとどまる。",
                  "help.section.anchors": "4. アンカーと引用",
                  "help.anchors.intro": "特定の投稿に返信するには、>> 記号の後に投稿番号を入力します。",
                  "help.anchors.input": "入力",
                  "help.anchors.result": "結果",
                  "help.anchors.hover": "7chでは、青いアンカーリンク（>>15 など）にカーソルを合わせると、その投稿のポップアッププレビューが表示されます。クリックすると、通常、逆リンクが追加されるか、投稿にジャンプします。",
                  "help.section.ids": "5. 日次IDシステム",
                  "help.ids.intro": "ユーザー名の代わりに Daily ID を使い、同一日・同一板での発言者を識別します。ID は送信元 IP、UTC 日付、板 ID、ソルトから計算されます。",
                  "help.ids.example": "IDの例：",
                  "help.ids.scope": "範囲：同一 IP・同一板・同一日で安定します。",
                  "help.ids.reset": "リセット：IDは毎日真夜中（UTC）に変更されます。",
                  "help.ids.privacy": "プライバシー：IDに実際のIPは表示されませんが、安全のためサーバーは必要なログを保持します。",

                  // QA Page
                  "qa.title": "Q&A / よくある質問",
                  "qa.subtitle": "質問と回答",
                  "qa.toc.title": "目次",
                  "qa.toc.access": "1. アクセスに関する問題",
                  "qa.toc.anonymity": "2. 匿名性について",
                  "qa.toc.identity": "3. 身元の区別",
                  "qa.toc.privacy": "4. プライバシーの信頼",
                  "qa.toc.opensource": "5. ソースとフィルタリング",
                  "qa.toc.deletion": "6. 削除ポリシー",
                  "qa.toc.report": "7. 通報",
                  "qa.toc.legal": "8. 法的リスク",
                  "qa.q1.question": "Q: 中国大陸から直接アクセスできないのはなぜですか？",
                  "qa.q1.answer1": "A: 本サイトのフロントエンドは Vercel のグローバルエッジネットワークでホスティングされています。",
                  "qa.q1.answer2": "地域によってはアクセスが制限される場合があります。",
                  "qa.q2.question": "Q: ここでの「匿名」は本当ですか？",
                  "qa.q2.answer1": "A: アカウント不要で匿名です。",
                  "qa.q2.answer2": "安全と運用のため、サーバーは必要な技術情報（例: IP）を記録します。",
                  "qa.q3.question": "Q: ログインしないなら、「私が私」であることをどう区別するのですか？",
                  "qa.q3.answer1": "A: サーバーが送信元 IP、UTC 日付、板 ID、秘密ソルトから Daily ID を生成します。",
                  "qa.q3.note": "注意：",
                  "qa.q3.note-text": "日付変更、板の切替、回線変更で ID は変わります。7chではアイデンティティは流動的です。",
                  "qa.q4.question": "Q: プライバシーを侵害しないと信じる理由は？",
                  "qa.q4.answer1": "A: データ最小化と主要メカニズムの公開を行っています。",
                  "qa.q4.answer2": "広告トラッカーは使わず、詳細はプライバシーポリシーと技術文書をご覧ください。",
                  "qa.q5.question": "Q: なぜソースやNGワードリストを公開しないのですか？",
                  "qa.q5.answer1": "A: 安全と運用上の理由からソースは非公開です。",
                  "qa.q5.answer2": "NGワードリストも回避防止のため非公開で、仕組みのみ公開しています。",
                  "qa.q6.question": "Q: 間違えて投稿しました。削除できますか？",
                  "qa.q6.answer1": "A: 自助削除はサポートしていません。",
                  "qa.q6.answer2": "匿名性により本人確認が難しく、自己削除は提供しません。違法/侵害は連絡してください。",
                  "qa.q7.question": "Q: 違法・侵害コンテンツを発見したらどうすればいいですか？",
                  "qa.q7.answer1": "A: 次のメールアドレスまでメールを送ってください",
                  "qa.q7.answer2": "安全のため、匿名メールでの連絡をお勧めします。メールにスレッドIDと具体的な違反理由を明記してください。管理者が定期的に処理します。",
                  "qa.q8.question": "Q: ここで発言しても法的リスクはありませんか？",
                  "qa.q8.answer1": "A: インターネットは法外の地ではありません。",
                  "qa.q8.answer2": "ユーザープロファイリングは行いませんが、インターネット基盤には痕跡が残る場合があります。重大な違法行為の場合は法的手続きに従います。",
                  "qa.q8.answer3": "法的要請がある場合、必要なサーバーログを提供することがあります。",

                  // Pagination
                  "pagination.prev": "前のページ",
                  "pagination.next": "次のページ",
                  "pagination.info": "{{current}} / {{total}} ページ",
                  "pagination.load_more": "もっと読み込む",
                  "pagination.no_more": "これ以上ありません",
            }
      }
};

i18n
      .use(initReactI18next)
      .init({
            resources,
            // 语言选择优先 localStorage，其次默认中文；SSR 场景安全回退。
            // Language priority: localStorage > default zh-CN; SSR-safe fallback.
            lng: typeof window !== 'undefined' ? (localStorage.getItem('7ch_lang') || 'zh-CN') : 'zh-CN',
            fallbackLng: 'zh-CN',
            interpolation: {
                  escapeValue: false
            }
      });

export default i18n;
