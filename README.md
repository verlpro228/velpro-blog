<div align="center">

# Velpro Blog

**Vue 3 + FastAPI 打造的现代全栈个人博客**

知识库 · 作品集 · 后台 CMS · AI 助手 · 一次部署

[在线演示](https://www.velpro.xyz) · [快速开始](#-快速开始) · [架构设计](#-全栈架构) · [API 概览](#-api-概览)

[![Vue](https://img.shields.io/badge/Vue-3.5-4FC08D?logo=vuedotjs&logoColor=fff)](https://vuejs.org)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=fff)](https://vite.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.x-3178C6?logo=typescript&logoColor=fff)](https://www.typescriptlang.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi&logoColor=fff)](https://fastapi.tiangolo.com)
[![Python](https://img.shields.io/badge/Python-%3E%3D3.10-3776AB?logo=python&logoColor=fff)](https://www.python.org)
[![MySQL](https://img.shields.io/badge/MySQL-8.0+-4479A1?logo=mysql&logoColor=fff)](https://www.mysql.com)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-000000?logo=vercel&logoColor=fff)](https://vercel.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://makeapullrequest.com)

</div>

## 📖 项目简介

Velpro Blog 是一个**前后端一体的全栈个人博客系统**：前台负责内容呈现与阅读体验，后台提供完整的内容管理（CMS），后端以 REST API 支撑数据与 AI 能力。整个项目保持**单一仓库、一次部署**——前端静态资源与后端 Serverless 函数由同一平台托管，天然同域，无需额外跨域配置。

- **前台** — 首页、知识库、项目展示、个人介绍四大页面，GSAP 滚动动画与 WebGL 背景
- **后台 CMS** — 文档、项目、介绍三大内容模块可视化编辑，账号安全设置，写作即发布
- **后端 API** — FastAPI + SQLAlchemy + MySQL，统一 `{ code, data, message }` 响应契约，JWT 鉴权
- **AI 助手** — 基于智谱 GLM 的 SSE 流式对话，API Key 仅存服务端，不暴露给浏览器

## 🖥 预览

<!-- 建议：截取「首页 / 知识库 / 文档编辑器」页面截图或 GIF，放入 docs/screenshots/ 目录后替换下方占位 -->

| 首页 | 知识库 | 文档编辑器 |
| :---: | :---: | :---: |
| ![](docs/screenshots/home.png) | ![](docs/screenshots/knowledge.png) | ![](docs/screenshots/editor.png) |

## ✨ 特性

### 前台展示

- **首页** — 动态 Hero、博客故事、技术亮点，GSAP 滚动动画与悬停交互
- **知识库** — 分类浏览、Fuse.js 模糊搜索、阅读进度追踪、Markdown 渲染、目录导航
- **项目展示** — 卡片式项目介绍，涵盖技术栈、角色职责、核心功能、交付成果与量化指标
- **个人介绍** — 个人简介、技能树、项目经验、教育背景、联系方式
- 响应式布局与暗色模式支持

### 后台 CMS

- **登录认证** — JWT 签发与校验、Argon2 密码哈希、路由守卫、401 自动登出
- **文档管理** — 写作 / 预览 / 分屏三种模式，草稿自动保存，Markdown 统计信息，标签与摘要管理
- **项目管理** — 项目卡片全字段编辑与排序，实时同步前台展示
- **介绍管理** — 站点资料、技能树、教育背景、时间线可视化编辑
- **账号设置** — 个人资料修改与密码更新（修改后需重新登录）

### AI 助手（可选）

- 内置流式对话助手，打字机式增量渲染，基于智谱 GLM 模型
- API Key 只保存在服务端，前端经由后端代理请求，不暴露凭证
- 未配置 Key 时助手不可用，博客其余功能不受影响（详见 [AI 助手工作原理](#-ai-助手工作原理)）

### 工程与性能

- **按需分包** — 构建时按依赖域拆分 chunk（`vue-vendor` / `markdown` / `motion` / `search-tools` 等），页面路由懒加载
- **大字段隔离** — 文档列表接口不查询/不返回 70KB+ 的正文内容，点开单篇时才加载全文
- **响应压缩与短缓存** — 后端 GZip 压缩（正文体积可减少 80%+），列表/详情接口设置 `Cache-Control` 短缓存
- **Serverless 友好** — 小连接池 + 空闲回收 + 探活策略，适配函数冻结/唤醒与跨地域数据库
- **类型安全** — TypeScript 全量类型覆盖，`vue-tsc` 严格检查；组件与 API 自动导入，开发零样板代码

## 🏗 全栈架构

```mermaid
flowchart LR
    A["浏览器<br/>Vue 3 SPA"] -->|"fetch / axios → /api/*"| B{"运行环境"}
    B -->|"开发环境<br/>Vite Proxy"| C["FastAPI<br/>uvicorn :8000"]
    B -->|"生产环境<br/>Vercel Serverless"| D["api/index.py<br/>@vercel/python"]
    C --> E[("MySQL<br/>Aiven / 自建")]
    D --> E
    D -->|"SSE 流式转发"| F["智谱 GLM API"]
```

- **开发环境** — Vite 将 `/api` 代理到本地 FastAPI（`127.0.0.1:8000`），前后端独立进程、同域联调，可用 `VITE_API_PROXY_TARGET` 覆盖代理目标
- **生产环境** — `vercel.json` 将 `/api/*` 路由到 Python Serverless 函数（`api/index.py` 导出 FastAPI app），其余路径托管前端静态资源，天然同域
- **数据层** — SQLAlchemy ORM + 小连接池复用连接，跨地域场景下避免重复 TLS 握手开销
- **契约层** — 所有接口统一返回 `{ code, data, message }`，`code === 0` 表示成功，前端拦截器统一处理异常与登录失效

## 🧱 技术栈

**前端**

| 技术 | 版本 | 用途 |
|------|------|------|
| [Vue](https://vuejs.org) | ^3.5 | 渐进式 JavaScript 框架 |
| [Vite](https://vite.dev) | ^8.0 | 下一代前端构建工具 |
| [TypeScript](https://www.typescriptlang.org) | ^6.0 | JavaScript 超集，提供类型检查 |
| [Vue Router](https://router.vuejs.org) | ^4.6 | Vue 官方路由管理器（Hash 模式） |
| [Pinia](https://pinia.vuejs.org) | ^3.0 | Vue 状态管理库 |
| [Element Plus](https://element-plus.org) | ^2.13 | Vue 3 UI 组件库 |
| [Tailwind CSS](https://tailwindcss.com) | ^3.4 | 原子化 CSS 框架 |
| Sass | ^1.99 | CSS 预处理器 |
| Axios | ^1.15 | HTTP 请求库（统一封装与拦截器） |
| markdown-it + highlight.js | ^14.1 / ^11.11 | Markdown 渲染与代码高亮 |
| Fuse.js | ^7.3 | 轻量级模糊搜索 |
| GSAP | ^3.15 | 专业动画库 |
| Vanta + Three | ^0.5 / ^0.183 | WebGL 动效背景 |
| @vueuse/core | ^14.2 | Vue Composition API 工具集 |
| pinia-plugin-persistedstate | ^4.7 | Pinia 状态持久化 |

**后端**

| 技术 | 版本 | 用途 |
|------|------|------|
| [FastAPI](https://fastapi.tiangolo.com) | ^0.115 | 高性能异步 Web 框架 |
| [SQLAlchemy](https://www.sqlalchemy.org) | ^2.0 | Python ORM，声明式模型 |
| [PyMySQL](https://pymysql.readthedocs.io) | ^1.1 | MySQL 驱动（纯 Python） |
| [PyJWT](https://pyjwt.readthedocs.io) | ^2.8 | JWT 签发与校验 |
| [pwdlib](https://frankie567.github.io/pwdlib)（Argon2） | ^0.2 | 密码哈希 |
| [httpx](https://www.python-httpx.org) | ^0.27 | 异步 HTTP 客户端（SSE 流式转发） |
| [pydantic-settings](https://docs.pydantic.dev/latest/concepts/pydantic_settings) | ^2.4 | 环境变量与配置管理 |
| [uvicorn](https://www.uvicorn.org) | ^0.30 | ASGI 服务器 |

**数据与部署**

| 技术 | 用途 |
|------|------|
| [MySQL](https://www.mysql.com)（Aiven 或自建） | 文档 / 用户 / 项目 / 站点资料持久化，支持 SSL 连接 |
| [Vercel](https://vercel.com) | 静态资源托管 + Python Serverless 函数，`vercel.json` 声明构建与路由 |

## 🚀 快速开始

**环境要求**

| 依赖 | 版本 | 说明 |
| --- | --- | --- |
| [Node.js](https://nodejs.org) | >= 19 且 < 25 | 前端构建与运行 |
| [pnpm](https://pnpm.io) | 11.x | 推荐，`packageManager` 已声明 |
| [Python](https://www.python.org) | >= 3.10 | 后端运行环境 |
| [MySQL](https://www.mysql.com) | >= 8.0 | 本地自建或使用 Aiven 等云数据库 |

### 1. 克隆与安装

```bash
# 克隆仓库
git clone https://github.com/verlpro228/velpro-blog.git
cd velpro-blog

# 安装前端依赖
pnpm install

# 创建后端虚拟环境并安装依赖
python -m venv .venv
.venv\Scripts\activate         # Windows
# source .venv/bin/activate    # macOS / Linux
pip install -r requirements.txt
```

### 2. 配置环境变量

```bash
cp .env.example .env           # Windows: copy .env.example .env
```

至少填写 `DATABASE_URL` 与 `JWT_SECRET`；本地 MySQL 需先创建数据库（默认 `velpro_blog`）。首次启动时若配置了 `ADMIN_PASSWORD`，后端会自动建表并创建管理员账号。完整变量见 [环境变量](#-环境变量)。

### 3. 启动前后端

```bash
# 终端 1：启动后端（默认 8000 端口，自动重载）
python -m uvicorn backend.app.main:app --reload --port 8000

# 终端 2：启动前端（默认 5173 端口，/api 已代理到 8000）
pnpm dev
```

启动后访问 <http://localhost:5173>，登录 `/login` 进入后台（账号为 `ADMIN_USERNAME` / `ADMIN_PASSWORD`）。

### 4.（可选）导入种子数据

仓库内置 8 篇静态知识文档与项目/介绍示例数据，可一键导入数据库：

```bash
# 静态文档 → JSON → MySQL
pnpm dlx tsx scripts/export-docs.ts > scripts/docs-seed.json
python scripts/seed_docs.py

# 项目展示 + 个人介绍示例数据
python scripts/seed_content.py
```

两个脚本均可重复执行，按 `id` 覆盖更新。

### 常用命令

| 命令 | 说明 |
| --- | --- |
| `pnpm dev` | 启动前端开发服务器 |
| `pnpm build` | 类型检查 + 生产构建 |
| `pnpm preview` | 预览生产构建 |
| `pnpm type-check` | 仅运行 TypeScript 类型检查 |
| `python -m uvicorn backend.app.main:app --reload` | 启动后端开发服务器 |
| `python scripts/seed_docs.py` | 导入文档种子数据 |
| `python scripts/seed_content.py` | 导入项目/介绍种子数据 |

## ⚙️ 环境变量

后端配置由 `pydantic-settings` 从根目录 `.env` 加载（`backend/app/config.py`）：

| 变量 | 必填 | 说明 | 默认值 |
| --- | --- | --- | --- |
| `DATABASE_URL` | 是 | MySQL 连接串，如 `mysql+pymysql://user:pass@host:port/db` | 本地 `velpro_blog` 库 |
| `DB_SSL_CA_PATH` | 否 | Aiven CA 证书路径（留空则仅加密不验证证书） | `backend/certs/ca.pem` |
| `JWT_SECRET` | 生产必填 | JWT 签名密钥，建议随机长字符串 | `please-change-me` |
| `JWT_EXPIRE_HOURS` | 否 | Token 有效期（小时） | `168`（7 天） |
| `ADMIN_USERNAME` | 否 | 管理员用户名 | `velpro` |
| `ADMIN_PASSWORD` | 首次启动必填 | 管理员初始密码（仅首次建号生效，之后以数据库为准） | - |
| `ADMIN_NAME` | 否 | 管理员昵称 | `Velpro` |
| `ADMIN_AVATAR` | 否 | 管理员头像地址 | DiceBear 默认头像 |
| `ADMIN_TAGLINE` | 否 | 管理员签名 | `Frontend Engineer` |
| `LONGCAT_API_KEY` | 启用 AI 时必填 | 智谱开放平台 API Key（兼容 `ZHIPU_API_KEY` 等别名） | - |
| `LONGCAT_BASE_URL` | 否 | 上游 API 地址 | 智谱开放平台 |
| `LONGCAT_MODEL` | 否 | 模型名称 | `glm-4-flash-250414` |
| `VITE_API_PROXY_TARGET` | 否 | 开发环境 `/api` 代理目标 | `http://127.0.0.1:8000` |
| `VITE_AI_PROXY_ENDPOINT` | 否 | 前端请求的 AI 代理端点 | `/api/ai/chat` |

## 🔌 API 概览

所有接口以 `/api` 为前缀，统一返回 `{ code, data, message }`：

| 方法 | 端点 | 说明 | 鉴权 |
| --- | --- | --- | --- |
| `POST` | `/api/auth/login` | 登录，返回 Token 与用户信息 | - |
| `GET` | `/api/auth/profile` | 获取当前用户信息 | ✅ |
| `PUT` | `/api/auth/profile` | 更新昵称与签名 | ✅ |
| `PUT` | `/api/auth/password` | 修改密码 | ✅ |
| `GET` | `/api/docs` | 文档列表（不含正文大字段） | - |
| `GET` | `/api/docs/{id}` | 文档详情（含全文） | - |
| `POST` | `/api/docs` | 新建文档 | ✅ |
| `PUT` | `/api/docs/{id}` | 更新文档 | ✅ |
| `DELETE` | `/api/docs/{id}` | 删除文档 | ✅ |
| `GET` | `/api/projects` | 项目列表（按排序权重） | - |
| `POST` | `/api/projects` | 新建项目 | ✅ |
| `PUT` | `/api/projects/{id}` | 更新项目 | ✅ |
| `DELETE` | `/api/projects/{id}` | 删除项目 | ✅ |
| `GET` | `/api/profile` | 获取站点（个人介绍页）资料 | - |
| `PUT` | `/api/profile` | 更新站点资料 | ✅ |
| `POST` | `/api/ai/chat` | AI 流式对话（SSE） | 服务端 Key |
| `GET` | `/api/health` | 健康检查 | - |

后端启动后可访问 FastAPI 自动生成的交互式文档：<http://127.0.0.1:8000/docs>。

## 🤖 AI 助手工作原理

前端统一请求 `/api/ai/chat`，由后端转发到智谱 API 并以 SSE 流式回传，API Key 始终留在服务端：

- **开发环境** — Vite 代理把 `/api/ai/chat` 转发到本地 FastAPI（`backend/app/routers/ai.py`），后端经 `httpx` 流式透传上游响应
- **生产环境** — 同一条链路由 Vercel Python Serverless（`api/index.py`）承载，部署时在平台配置同名环境变量即可

上游返回非流式响应时自动降级为普通 JSON，错误统一转换为 `{ error: { message } }` 格式。

## 📁 项目结构

```text
velpro-blog/
├── api/
│   └── index.py              # Vercel Python 入口，导出 FastAPI app
├── backend/                  # 后端（FastAPI）
│   ├── app/
│   │   ├── routers/          # 路由模块：auth / docs / ai / projects / profile
│   │   ├── config.py         # pydantic-settings 环境配置
│   │   ├── database.py       # SQLAlchemy 引擎 / 连接池 / Session
│   │   ├── models.py         # 数据模型：Doc / User / Project / SiteProfile
│   │   ├── schemas.py        # Pydantic 请求模型与统一响应 ok()
│   │   ├── security.py       # JWT 签发校验 + Argon2 密码哈希
│   │   └── main.py           # 应用入口：中间件 / 异常处理 / 路由注册 / 自动建表
│   └── certs/                # 数据库 CA 证书目录
├── scripts/                  # 数据脚本（文档导出 / 种子数据导入）
├── public/                   # 静态资源
├── src/
│   ├── api/                  # Axios 封装（http.ts）与接口模块（auth / docs / ai / projects / profile）
│   ├── components/           # 公共组件（common / home / knowledge）
│   ├── constants/            # 应用常量（导航 / 存储键）
│   ├── data/                 # 静态文档种子数据（8 篇示例文档）
│   ├── hooks/                # 组合式函数（动画 / 搜索 / 认证 / 主题 / 请求等）
│   ├── layout/               # 布局组件（BaseLayout / AdminLayout）
│   ├── router/               # 路由配置与登录守卫
│   ├── store/                # Pinia 状态管理（user / docs / projects / profile）
│   ├── styles/               # 全局样式与 CSS 变量
│   ├── types/                # TypeScript 类型定义
│   ├── utils/                # 工具函数（Markdown 渲染 / 目录 / 存储 / 提示）
│   ├── views/                # 页面组件（含 admin/ 后台页面）
│   ├── App.vue               # 根组件
│   └── main.ts               # 应用入口
├── .env.example              # 环境变量模板
├── requirements.txt          # Python 依赖
├── vercel.json               # Vercel 构建与路由配置
├── vite.config.ts            # Vite 配置（代理 / 分包 / 自动导入）
└── package.json
```

## 🔀 页面路由

| 路径 | 页面 | 说明 |
| --- | --- | --- |
| `/` | 首页 | Hero、博客故事、技术亮点 |
| `/knowledge` | 知识库 | 文档分类浏览与搜索 |
| `/projects` | 项目展示 | 项目卡片 |
| `/about` | 个人介绍 | 个人简介与技能树 |
| `/login` | 登录 | 后台登录入口 |
| `/admin/editor` | 文档管理 | 需登录，支持写作 / 预览 / 分屏 |
| `/admin/projects` | 项目管理 | 需登录，项目全字段编辑 |
| `/admin/profile` | 介绍管理 | 需登录，站点资料编辑 |
| `/admin/settings` | 账号设置 | 需登录，资料与密码修改 |
| `*` | 404 | 页面不存在 |

## 🚢 部署

**Vercel（推荐）**

导入仓库即可部署，`vercel.json` 已声明完整构建与路由方案：

- `api/index.py` — Python Serverless 函数承载全部 `/api/*` 请求（`maxDuration: 60`）
- `package.json` — 静态构建产出 `dist/`
- 其余路径回退到 `index.html`，支持前端路由

只需在项目 Settings → Environment Variables 中配置 `DATABASE_URL`、`JWT_SECRET`、`ADMIN_PASSWORD`、`LONGCAT_API_KEY` 等变量。若数据库未使用 CA 证书，可留空 `DB_SSL_CA_PATH`（仅加密不验证）。

**静态托管 + 独立后端（VPS / 容器）**

前端执行 `pnpm build` 后托管 `dist/`，后端用 uvicorn 常驻启动，由 Nginx 反代 `/api`：

```bash
# 后端（生产示例）
python -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000
```

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/velpro-blog/dist;
    index index.html;

    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        # SSE 流式响应需要关闭缓冲
        proxy_buffering off;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

> GitHub Pages 等纯静态托管不包含后端与 AI 代理，知识库、项目、介绍等依赖接口的内容将无法加载（页面会提示请求失败，浏览器中已缓存的数据仍可展示）。

## 🧭 二次开发

- **新页面** — 在 `src/views/` 创建组件，并在 `src/router/routes.ts` 注册路由
- **新组件** — 放入 `src/components/` 对应目录，模板中直接使用（自动导入）
- **新接口** — 后端在 `backend/app/routers/` 添加路由、`schemas.py` 定义模型；前端在 `src/api/modules/` 添加模块、`src/types/` 补充类型
- **状态管理** — Pinia Store 放 `src/store/modules/`，可通过 `persist` 配置持久化字段
- **数据模型** — 新增表时在 `backend/app/models.py` 定义，启动时自动建表（生产环境建议引入迁移工具）

## 🌐 浏览器支持

| 浏览器 | 支持版本 |
|--------|----------|
| Chrome | >= 90 |
| Edge | >= 90 |
| Firefox | >= 88 |
| Safari | >= 14 |

## 🤝 贡献

欢迎通过 Issue 与 Pull Request 参与项目：

1. Fork 本仓库
2. 创建特性分支：`git checkout -b feature/amazing-feature`
3. 提交改动：`git commit -m 'Add some amazing feature'`
4. 推送分支：`git push origin feature/amazing-feature`
5. 发起 Pull Request

## 📄 License

[MIT](./LICENSE) © [verlpro228](https://github.com/verlpro228)
