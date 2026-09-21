<div align="center">

# Velpro Blog

**Vue 3 + TypeScript 打造的现代个人博客**

技术分享 · 知识库 · 管理后台 · 内置 AI 助手

[在线演示](https://www.velpro.xyz) · [快速开始](#-快速开始) · [AI 助手](#-ai-助手可选)

[![Vue](https://img.shields.io/badge/Vue-3.5-4FC08D?logo=vuedotjs&logoColor=fff)](https://vuejs.org)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=fff)](https://vite.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.x-3178C6?logo=typescript&logoColor=fff)](https://www.typescriptlang.org)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D19-339933?logo=nodedotjs&logoColor=fff)](https://nodejs.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://makeapullrequest.com)

</div>

## 🖥 预览

<!-- 建议：截取「首页 / 知识库 / 文档编辑器」页面截图或 GIF，放入 docs/screenshots/ 目录后替换下方占位 -->

| 首页 | 知识库 | 文档编辑器 |
| :---: | :---: | :---: |
| ![](docs/screenshots/home.png) | ![](docs/screenshots/knowledge.png) | ![](docs/screenshots/editor.png) |

## ✨ 特性

**前台**

- **首页** — 动态 Hero、博客故事、技术亮点，GSAP 滚动动画与悬停交互
- **知识库** — 分类浏览、关键词搜索、阅读进度追踪、Markdown 渲染、目录导航
- **项目展示** — 卡片式项目介绍，涵盖技术栈、角色职责、核心功能、交付成果
- **关于页面** — 个人简介、技能树、项目经验、教育背景、联系方式
- 响应式布局与暗色模式支持

**管理后台**

- **登录认证** — JWT Token 鉴权，登录状态持久化，路由守卫与权限控制
- **文档编辑器** — 写作 / 预览 / 分屏三种模式，草稿自动保存，Markdown 统计信息
- **文档管理** — 创建、编辑、删除文档，标签与摘要管理

**AI 助手**

- 内置流式对话助手，基于智谱 GLM 模型
- API Key 只保存在服务端，前端经由代理请求，不暴露凭证
- 未配置 Key 时助手不可用，博客其余功能不受影响（详见 [AI 助手（可选）](#-ai-助手可选)）

## 🚀 快速开始

**环境要求**

| 依赖 | 版本 |
| --- | --- |
| [Node.js](https://nodejs.org) | >= 19 且 < 25 |
| [pnpm](https://pnpm.io) | 11.x（推荐，`packageManager` 已声明） |

```bash
# 克隆仓库
git clone https://github.com/verlpro228/velpro-blog.git
cd velpro-blog

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev
```

启动后访问 <http://localhost:5173>

常用命令：

| 命令 | 说明 |
| --- | --- |
| `pnpm dev` | 启动开发服务器 |
| `pnpm build` | 类型检查 + 生产构建 |
| `pnpm preview` | 预览生产构建 |
| `pnpm type-check` | 仅运行 TypeScript 类型检查 |

## 🤖 AI 助手（可选）

博客内置 AI 对话助手，默认通过服务端代理调用[智谱开放平台](https://open.bigmodel.cn)的 GLM 模型。

在项目根目录创建 `.env.local`：

```bash
# 必填：智谱开放平台 API Key
LONGCAT_API_KEY=your-api-key

# 可选
LONGCAT_MODEL=glm-4-flash-250414
LONGCAT_BASE_URL=https://open.bigmodel.cn/api/paas/v4
```

**环境变量说明**

| 变量 | 必填 | 说明 | 默认值 |
| --- | --- | --- | --- |
| `LONGCAT_API_KEY` | 启用 AI 时必填 | 智谱 API Key（兼容 `ZHIPU_API_KEY` 等别名） | - |
| `LONGCAT_MODEL` | 否 | 模型名称 | `glm-4-flash-250414` |
| `LONGCAT_BASE_URL` | 否 | 上游 API 地址 | 智谱开放平台 |
| `VITE_AI_PROXY_ENDPOINT` | 否 | 前端请求的代理端点 | `/api/ai/chat` |

**工作原理**

前端统一请求 `/api/ai/chat`，由代理转发到智谱 API 并以 SSE 流式返回，API Key 始终留在服务端：

- 开发环境：`vite.config.ts` 注册的中间件（`server/longcat-proxy.js`）
- 生产环境：`api/ai/chat.js`（Vercel Serverless Function），部署时在平台配置同名环境变量

## 🧱 技术栈

**核心框架**

| 技术 | 版本 | 用途 |
|------|------|------|
| [Vue](https://vuejs.org) | ^3.5 | 渐进式 JavaScript 框架 |
| [Vite](https://vite.dev) | ^8.0 | 下一代前端构建工具 |
| [TypeScript](https://www.typescriptlang.org) | ^6.0 | JavaScript 超集，提供类型检查 |
| [Vue Router](https://router.vuejs.org) | ^4.6 | Vue 官方路由管理器 |
| [Pinia](https://pinia.vuejs.org) | ^3.0 | Vue 状态管理库 |

**UI 与样式**

| 技术 | 版本 | 用途 |
|------|------|------|
| [Element Plus](https://element-plus.org) | ^2.13 | Vue 3 UI 组件库 |
| [Tailwind CSS](https://tailwindcss.com) | ^3.4 | 原子化 CSS 框架 |
| Sass | ^1.99 | CSS 预处理器 |

**功能库**

| 技术 | 版本 | 用途 |
|------|------|------|
| Axios | ^1.15 | HTTP 请求库 |
| markdown-it | ^14.1 | Markdown 解析器 |
| highlight.js | ^11.11 | 代码语法高亮（170+ 语言） |
| Fuse.js | ^7.3 | 轻量级模糊搜索 |
| GSAP | ^3.15 | 专业动画库 |
| Vanta + Three | ^0.5 / ^0.183 | WebGL 动效背景 |
| @vueuse/core | ^14.2 | Vue Composition API 工具集 |
| pinia-plugin-persistedstate | ^4.7 | Pinia 状态持久化 |

**开发工具**

| 技术 | 版本 | 用途 |
|------|------|------|
| vue-tsc | ^3.2 | Vue TypeScript 检查 |
| unplugin-auto-import | ^21.0 | 自动导入 API |
| unplugin-vue-components | ^32.0 | 自动导入组件 |

## 📁 项目结构

```text
velpro-blog/
├── api/                  # Serverless 函数（AI 代理，Vercel 部署）
│   └── ai/chat.js
├── server/               # 开发环境 AI 代理（Vite 中间件复用）
├── public/               # 静态资源
├── src/
│   ├── api/              # Axios 封装与接口模块（auth / docs / ai）
│   ├── components/       # 公共组件（common / home / knowledge）
│   ├── hooks/            # 组合式函数（动画 / 搜索 / 认证 / 主题等）
│   ├── layout/           # 布局组件（基础布局 / 后台布局）
│   ├── router/           # 路由配置
│   ├── store/            # Pinia 状态管理
│   ├── styles/           # 全局样式与 CSS 变量
│   ├── types/            # TypeScript 类型定义
│   ├── utils/            # 工具函数（Markdown 渲染 / 目录 / 存储等）
│   ├── views/            # 页面组件（含 admin/ 后台页面）
│   ├── App.vue           # 根组件
│   └── main.ts           # 应用入口
├── index.html
├── vite.config.ts
└── package.json
```

## 🔀 页面路由

| 路径 | 页面 | 说明 |
| --- | --- | --- |
| `/` | 首页 | Hero、博客故事、技术亮点 |
| `/knowledge` | 知识库 | 文档分类浏览与搜索 |
| `/projects` | 项目展示 | 项目卡片 |
| `/about` | 关于 | 个人简介与技能树 |
| `/login` | 登录 | 后台登录入口 |
| `/admin/editor` | 文档编辑器 | 需登录，支持写作 / 预览 / 分屏 |

## 🧭 二次开发

- **新页面**：在 `src/views/` 创建组件，并在 `src/router/routes.ts` 注册路由
- **新组件**：放入 `src/components/` 对应目录，模板中直接使用（自动导入）
- **新接口**：在 `src/api/modules/` 添加模块，类型定义放 `src/types/`
- **状态管理**：Pinia Store 放 `src/store/modules/`，可通过 `persist` 配置持久化字段

## 🚢 部署

**Vercel（推荐）**

导入仓库即可部署，`api/ai/chat.js` 代理函数开箱即用，只需在项目设置中配置 `LONGCAT_API_KEY` 等环境变量。

**静态托管（GitHub Pages / Nginx 等）**

执行 `pnpm build` 后托管 `dist/` 目录。注意：静态托管不包含 AI 代理函数，AI 助手不可用。

GitHub Pages 需修改 `vite.config.ts` 中的 `base` 为仓库名：

```typescript
export default defineConfig({
  base: '/velpro-blog/',
  // ...
})
```

Nginx 配置示例：

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/velpro-blog/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

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
