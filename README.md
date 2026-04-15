# Velpro Blog

一个基于 Vue 3 + Vite 构建的现代化个人博客系统，专注于技术分享与项目展示。内置知识库管理后台，支持 Markdown 文档编写与实时预览。

## 在线演示

- **博客地址**: https://velpro-blog.vercel.app/

## 功能特点

### 前台展示

- **首页** - 动态 Hero 区域、博客故事、技术亮点展示，流畅的 GSAP 滚动动画与悬停交互
- **知识库** - 分类浏览、关键词搜索、阅读进度追踪、Markdown 渲染、目录导航
- **项目展示** - 卡片式项目介绍，包含技术栈、角色职责、核心功能、交付成果等多维度信息
- **关于页面** - 个人简介、技能树、项目经验、教育背景、联系方式

### 后台管理

- **登录认证** - JWT Token 鉴权机制，支持登录状态持久化
- **文档编辑器** - 三种编辑模式（写作/预览/分屏）、草稿自动保存、Markdown 统计信息
- **文档管理** - 创建、编辑、删除文档，标签管理，摘要编辑

### 技术亮点

- Vite 极速开发体验与生产构建
- Pinia 状态管理 + 持久化插件
- Element Plus 组件库
- Tailwind CSS 原子化样式
- Markdown-it + Highlight.js 代码高亮
- 动态路由与权限控制
- Axios 请求封装与拦截器
- GSAP 滚动动画与 Vanta 背景动效
- 响应式布局与暗色模式支持

## 技术栈

### 核心框架

| 技术 | 版本 | 用途 |
|------|------|------|
| Vue | ^3.5.32 | 渐进式 JavaScript 框架 |
| Vite | ^8.0.8 | 下一代前端构建工具 |
| TypeScript | ^6.0.2 | JavaScript 超集，提供类型检查 |
| Vue Router | ^4.6.4 | Vue 官方路由管理器 |
| Pinia | ^3.0.4 | Vue 状态管理库 |

### UI 与样式

| 技术 | 版本 | 用途 |
|------|------|------|
| Element Plus | ^2.13.7 | Vue 3 UI 组件库 |
| Tailwind CSS | ^3.4.17 | 原子化 CSS 框架 |
| Sass | ^1.99.0 | CSS 预处理器 |
| @element-plus/icons-vue | ^2.3.2 | Element Plus 图标库 |

### 功能库

| 技术 | 版本 | 用途 |
|------|------|------|
| Axios | ^1.15.0 | HTTP 请求库 |
| markdown-it | ^14.1.1 | Markdown 解析器 |
| highlight.js | ^11.11.1 | 代码语法高亮 |
| Fuse.js | ^7.3.0 | 轻量级模糊搜索 |
| GSAP | ^3.15.0 | 专业动画库 |
| Vanta | ^0.5.24 | WebGL 动效背景 |
| Three | ^0.183.2 | 3D 图形库 |
| @vueuse/core | ^14.2.1 | Vue Composition API 工具集 |
| pinia-plugin-persistedstate | ^4.7.1 | Pinia 状态持久化 |

### 开发工具

| 技术 | 版本 | 用途 |
|------|------|------|
| @vitejs/plugin-vue | ^6.0.6 | Vite Vue 插件 |
| vue-tsc | ^3.2.6 | Vue TypeScript 检查 |
| unplugin-auto-import | ^21.0.0 | 自动导入 API |
| unplugin-vue-components | ^32.0.0 | 自动导入组件 |
| autoprefixer | ^10.5.0 | CSS 前缀补全 |
| postcss | ^8.5.9 | CSS 转换工具 |

## 项目结构

```
velpro-blog/
├── public/                     # 静态资源
│   ├── favicon.svg            # 网站 favicon
│   └── icons.svg              # SVG 图标集
├── src/
│   ├── api/                   # API 请求模块
│   │   ├── http.ts           # Axios 实例与拦截器
│   │   └── modules/          # API 接口分组
│   │       ├── auth.ts       # 认证相关接口
│   │       └── docs.ts       # 文档管理接口
│   ├── assets/               # 本地静态资源
│   │   ├── blog-logoplus.svg # 博客 Logo
│   │   ├── hero.png          # 首屏背景图
│   │   ├── vue.svg          # Vue Logo
│   │   └── vite.svg         # Vite Logo
│   ├── components/            # 公共组件
│   │   ├── common/          # 通用组件
│   │   │   ├── AppDrawer.vue          # 抽屉组件
│   │   │   ├── AppEmptyState.vue      # 空状态组件
│   │   │   ├── AppFooter.vue          # 页脚组件
│   │   │   ├── AppLazyImage.vue       # 图片懒加载
│   │   │   ├── AppNavbar.vue          # 导航栏
│   │   │   ├── AppSkeletonLines.vue   # 骨架屏
│   │   │   ├── ProgressBar.vue       # 阅读进度条
│   │   │   ├── SectionTitle.vue      # 章节标题
│   │   │   └── index.ts              # 组件导出
│   │   ├── home/            # 首页组件
│   │   │   ├── HomeHeroSection.vue      # Hero 区域
│   │   │   ├── HomeHighlightsSection.vue # 亮点区域
│   │   │   └── HomeStorySection.vue     # 故事区域
│   │   └── knowledge/       # 知识库组件
│   │       ├── KnowledgeArticleList.vue # 文章列表
│   │       ├── KnowledgeCategoryMenu.vue# 分类菜单
│   │       └── KnowledgeTocNav.vue     # 目录导航
│   ├── constants/           # 常量定义
│   │   └── app.ts          # 应用级常量
│   ├── data/               # 静态数据
│   │   ├── auth.ts        # 认证模拟数据
│   │   ├── docs.ts        # 文档模拟数据
│   │   └── static-docs.ts # 静态文档数据
│   ├── hooks/             # Composition API 钩子
│   │   ├── useAsyncMarkdown.ts   # 异步 Markdown 渲染
│   │   ├── useAuth.ts           # 认证逻辑
│   │   ├── useGsap.ts           # GSAP 动画
│   │   ├── useKnowledgeSearch.ts # 知识库搜索
│   │   ├── useReadingProgress.ts # 阅读进度
│   │   ├── useRequest.ts        # 请求封装
│   │   ├── useScrollAnimation.ts # 滚动动画
│   │   ├── useTheme.ts          # 主题切换
│   │   └── useUser.ts           # 用户信息
│   ├── layout/            # 布局组件
│   │   ├── AdminLayout.vue # 后台管理布局
│   │   └── BaseLayout.vue  # 基础页面布局
│   ├── router/           # 路由配置
│   │   ├── index.ts      # 路由实例
│   │   └── routes.ts    # 路由规则
│   ├── store/            # Pinia 状态管理
│   │   ├── index.ts     # Store 实例
│   │   └── modules/
│   │       ├── docs.ts   # 文档状态管理
│   │       └── user.ts  # 用户状态管理
│   ├── styles/           # 全局样式
│   │   ├── index.css    # Tailwind 入口
│   │   ├── index.scss   # 全局样式入口
│   │   ├── reset.scss   # 样式重置
│   │   ├── transitions.scss # 过渡动画
│   │   └── variables.scss   # CSS 变量
│   ├── types/            # TypeScript 类型定义
│   │   ├── api.ts       # API 响应类型
│   │   ├── content.ts   # 内容类型
│   │   ├── router.d.ts  # 路由类型扩展
│   │   ├── user.ts      # 用户类型
│   │   └── vanta.d.ts   # Vanta 类型
│   ├── utils/            # 工具函数
│   │   ├── markdown.ts       # Markdown 处理
│   │   ├── markdownRenderer.ts # Markdown 渲染器
│   │   ├── markdownToc.ts    # Markdown 目录
│   │   ├── storage.ts        # 存储封装
│   │   └── toast.ts          # 轻提示
│   ├── views/            # 页面组件
│   │   ├── HomeView.vue       # 首页
│   │   ├── KnowledgeView.vue  # 知识库
│   │   ├── LoginView.vue      # 登录页
│   │   ├── NotFoundView.vue   # 404 页面
│   │   ├── ProjectsView.vue   # 项目展示
│   │   ├── AboutView.vue      # 关于页面
│   │   └── admin/
│   │       └── EditorView.vue  # 文档编辑器
│   ├── App.vue           # 根组件
│   └── main.ts           # 应用入口
├── index.html            # HTML 入口
├── package.json          # 项目配置
├── pnpm-lock.yaml       # pnpm 锁定文件
├── tsconfig.json        # TypeScript 配置
├── vite.config.ts       # Vite 配置
├── tailwind.config.ts   # Tailwind CSS 配置
└── postcss.config.cjs   # PostCSS 配置
```

## 路由结构

```
/                       → HomeView        (首页)
/knowledge              → KnowledgeView   (知识库)
/projects               → ProjectsView    (项目展示)
/about                  → AboutView       (关于)
/login                  → LoginView       (登录页)
/admin                  → AdminLayout     (后台布局)
  └─ /admin/editor     → EditorView      (文档编辑器)
```

## 快速开始

### 环境要求

- Node.js >= 18.0.0
- pnpm >= 8.0.0 (推荐) 或 npm >= 9.0.0

### 安装依赖

```bash
# 使用 pnpm (推荐)
pnpm install

# 或使用 npm
npm install
```

### 开发模式

```bash
# 启动开发服务器
pnpm dev

# 启动开发服务器 (兼容旧版 Vite 配置加载器)
pnpm dev --configLoader native
```

访问 http://localhost:5173

### 类型检查

```bash
pnpm type-check
```

### 构建生产版本

```bash
pnpm build
```

### 预览生产构建

```bash
pnpm preview
```

## 环境变量

项目使用 Vite，默认配置如下：

```typescript
// vite.config.ts
export default {
  base: '/',           // 部署基础路径
  server: {
    port: 5173,        // 开发服务器端口
    host: true,        // 允许外部访问
  },
}
```

## 主要功能详解

### 知识库系统

- **分类浏览**: 按分类筛选文档
- **实时搜索**: 基于 Fuse.js 的模糊搜索
- **阅读进度**: 页面顶部进度条显示
- **目录导航**: 自动提取 Markdown 标题生成目录
- **代码高亮**: 支持 170+ 编程语言

### 文档编辑器

- **三种模式**: 写作模式 / 预览模式 / 分屏模式
- **实时预览**: Markdown 即时渲染
- **草稿保存**: 自动保存编辑内容到本地存储
- **统计信息**: 字符数、标题数、预计阅读时间

### 认证系统

- **JWT Token**: 基于 Bearer Token 的身份验证
- **自动续期**: Token 过期自动跳转登录
- **持久化**: 登录状态本地持久化存储
- **权限控制**: 路由守卫与按钮级权限

## 部署说明

### GitHub Pages 部署

1. 修改 `vite.config.ts` 中的 `base` 为你的仓库名：

```typescript
export default defineConfig({
  base: '/velpro-blog/',  // 你的仓库名
  // ...
})
```

2. 构建项目：

```bash
pnpm build
```

3. 将 `dist` 目录内容推送到 `gh-pages` 分支

### Nginx 配置示例

```nginx
server {
    listen 80;
    server_name velpro.top;
    root /var/www/velpro-blog/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://backend-server:3000/;
    }
}
```

## 开发指南

### 添加新页面

1. 在 `src/views/` 创建页面组件
2. 在 `src/router/routes.ts` 添加路由配置
3. 如需布局，在路由 meta 中指定 layout 类型

### 添加新组件

公共组件放在 `src/components/` 对应目录下，组件可自动导入（得益于 unplugin-vue-components）。

### 添加 API 接口

1. 在 `src/api/modules/` 创建接口模块
2. 使用统一封装的 Axios 实例
3. 类型定义放在 `src/types/` 目录

### 状态管理

使用 Pinia 管理应用状态：

```typescript
// 定义 Store
export const useXxxStore = defineStore('xxx', {
  state: () => ({}),
  getters: {},
  actions: {},
  persist: {
    key: 'xxx',      // 持久化 key
    pick: ['field'], // 指定持久化字段
  },
})
```

## 浏览器支持

| 浏览器 | 支持版本 |
|--------|----------|
| Chrome | >= 90 |
| Firefox | >= 88 |
| Safari | >= 14 |
| Edge | >= 90 |

## License

MIT License
