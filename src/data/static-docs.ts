import type { KnowledgeDoc } from '@/types/content'

const formatDate = () => new Date().toISOString().slice(0, 10)

const createStaticDocId = () => `doc-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

const createDocRecord = (body: Partial<KnowledgeDoc>, id?: string): KnowledgeDoc => ({
  id: body.id ?? id ?? createStaticDocId(),
  title: body.title ?? '未命名文档',
  summary: body.summary ?? '暂无摘要',
  content: body.content ?? '# 新文档\n\n从这里开始撰写内容。',
  tags: body.tags ?? [],
  createTime: body.createTime ?? formatDate(),
})

export const cloneStaticDocs = (items: KnowledgeDoc[]) =>
  items.map((item) => ({
    ...item,
    tags: [...item.tags],
  }))

export const STATIC_DOCS: KnowledgeDoc[] = [
  createDocRecord({
    id: 'doc-1',
    title: '前端工程化知识体系总览',
    summary:
      '系统梳理版本控制、包管理、构建工具、代码质量、CI/CD、性能优化与架构演进，建立完整的前端工程化认知。',
    tags: ['前端工程化', '构建工具', 'CI/CD'],
    createTime: '2026-04-14',
    content: `前端工程化（Frontend Engineering）是将软件工程的方法论、工具和流程应用到前端开发中，旨在解决**代码质量、开发效率、团队协作、性能优化、部署运维**等核心问题。

以下是前端工程化知识点的全面总结，涵盖从基础工具链到高级架构的完整体系：

---

## 1. 版本控制与协作规范（Version Control & Collaboration）

### Git 工作流

- **分支策略**：Git Flow、GitHub Flow、Trunk Based Development（主干开发）
- **Commit 规范**：Conventional Commits（\`feat:\`、\`fix:\`、\`chore:\`、\`refactor:\`），用于自动生成 Changelog 和语义化版本
- **Code Review**：Pull Request / Merge Request 流程，自动化检查 + 人工审核

### Monorepo（单体仓库）

- 在一个仓库中管理多个项目或包
- 常用工具：Turborepo、Nx、Lerna、pnpm workspace
- 优势：共享依赖、原子提交、统一构建

---

## 2. 包管理与依赖治理（Package Management）

### 包管理器演进

- **npm**：生态最丰富，但安装速度与锁文件体验一般
- **yarn**：引入并行安装、PnP（Plug'n'Play）模式
- **pnpm**：基于硬链接 / 符号链接，节省磁盘空间，严格依赖隔离，避免幽灵依赖

### 依赖管理策略

- 锁定版本：\`package-lock.json\` / \`yarn.lock\` / \`pnpm-lock.yaml\`
- 依赖分析：识别大体积依赖、重复依赖、安全漏洞（\`npm audit\`、\`snyk\`）
- 私有源：配置 Verdaccio、Nexus 等私有 NPM Registry
- Monorepo 中统一复用同一版本依赖

---

## 3. 构建工具链（Build Tools）

前端构建的核心流程通常是：**AST 解析 -> 模块图构建 -> 转换 / 压缩 -> 输出产物**。

### 主流工具对比

- **Webpack**：生态成熟、配置灵活，适合复杂项目
- **Vite**：开发环境基于原生 ESM，冷启动快，生产环境使用 Rollup 打包
- **Rollup**：更适合库开发，Tree Shaking 效果好
- **Esbuild**：Go 编写，速度极快
- **SWC**：Rust 编写，可作为 Babel 的高性能替代

### 关键能力

- **Tree Shaking**：删除未使用代码
- **代码分割**：路由懒加载、动态导入、公共包拆分
- **资源处理**：图片压缩、字体处理、CSS 模块化
- **缓存策略**：基于 Content Hash 实现长期缓存

---

## 4. 代码质量与规范（Code Quality & Standards）

### 代码风格

- **ESLint**：静态代码分析
- **Prettier**：统一格式化
- **EditorConfig**：编辑器基础配置

### 类型安全

- **TypeScript**：减少运行时错误，增强重构信心
- **JSDoc**：在 JavaScript 项目中补充类型提示

### 测试体系

- **单元测试**：Jest、Vitest、Mocha / Chai
- **覆盖率工具**：Istanbul（nyc）、c8
- **E2E 测试**：Cypress、Playwright、Puppeteer
- **静态分析平台**：SonarQube
- **Git Hooks**：Husky + lint-staged

---

## 5. 组件化与设计系统（Component System & Design System）

- **组件库建设**：基于 Atomic Design（原子设计）拆分 UI
- **Storybook**：独立开发与展示组件
- **Design Token**：统一颜色、间距、字体等设计变量
- **低代码 / 零代码**：通过 Schema 驱动页面渲染和交互逻辑

---

## 6. 持续集成与持续部署（CI/CD）

### CI（Continuous Integration）

典型流程：

1. 拉取代码
2. 安装依赖
3. 执行 Lint
4. 运行测试
5. 代码扫描
6. 构建产物

常用工具：GitHub Actions、GitLab CI、Jenkins、CircleCI、Azure DevOps

### CD（Continuous Deployment）

- 自动发布到 CDN / Nginx / S3
- 灰度发布、蓝绿部署
- 快速回滚到稳定版本

### Docker 容器化

- 将应用和环境一起打包
- 保证“构建一次，到处运行”
- 可结合 Kubernetes 做编排

---

## 7. 性能工程（Performance Engineering）

### 指标监控

- **Core Web Vitals**
  - LCP：加载性能
  - FID / INP：交互响应
  - CLS：布局稳定性
- **RUM**：真实用户监控

### 优化手段

- 构建优化：代码压缩、图片转 WebP / AVIF、字体子集化
- 网络优化：HTTP/2、HTTP/3、资源预加载、缓存策略、Service Worker
- 运行时优化：虚拟列表、防抖节流、Web Workers、骨架屏、SSR / SSG / ISR
- Bundle 分析：Webpack Bundle Analyzer、Rollup Visualizer

---

## 8. 可观测性与监控（Observability & Monitoring）

- **错误监控**：Sentry、LogRocket、Bugsnag
- **前端埋点**：PV、UV、点击流
- **日志聚合**：ELK Stack、Splunk
- **APM**：追踪接口响应与链路耗时

---

## 9. 安全工程（Security）

- 依赖安全：Dependabot、Snyk
- XSS 防御：输入过滤、输出转义、CSP
- CSRF 防御：Token 验证、SameSite Cookie
- 敏感信息保护：环境变量、HTTPS、避免密钥硬编码
- 安全审计：Semgrep、SonarQube

---

## 10. 架构演进与现代化趋势

### 微前端（Micro-frontends）

- 方案：Qiankun、Micro-App、Single-SPA、Module Federation
- 挑战：样式隔离、应用通信、状态共享

### Serverless 前端

- 前端专注渲染
- 后端能力通过 Cloudflare Workers、AWS Lambda 等 FaaS 提供

### Rust 工具链

- SWC、Turbopack、Tauri、Wasm

### AI 辅助开发

- AI 辅助写代码
- AI 生成测试与重构建议
- AI 辅助生成文档

---

## 学习路径建议

1. **基础阶段**：熟练掌握 Git、Node.js、npm / yarn / pnpm、ESLint / Prettier
2. **构建阶段**：深入理解 Webpack / Vite 配置与打包原理
3. **质量阶段**：建立单元测试与 E2E 测试体系
4. **工程化阶段**：搭建 CI / CD、引入 Docker、实践 Monorepo
5. **架构阶段**：探索微前端、设计系统、Core Web Vitals 优化
6. **前沿阶段**：关注 Rust 工具链与 AI 工程化应用

---

前端工程化没有银弹，关键在于根据团队规模、业务复杂度和交付节奏，选择最适合当前场景的一组工具与流程。

\`\`\`ts
export function buildFrontendEngineeringMap() {
  return {
    collaboration: ['Git workflow', 'Code review', 'Monorepo'],
    tooling: ['Vite', 'Webpack', 'Rollup', 'SWC'],
    quality: ['ESLint', 'Prettier', 'TypeScript', 'Vitest'],
    delivery: ['CI/CD', 'Docker', 'Monitoring'],
  }
}
\`\`\`
`,
  }),
  createDocRecord({
    id: 'doc-2',
    title: 'UniApp 知识点全面总结',
    summary: '从核心架构、路由、组件、性能优化到打包发布的完整入门与进阶梳理。',
    tags: ['UniApp', 'Vue', '跨端'],
    createTime: '2026-04-15',
    content: `UniApp 是基于 **Vue.js** 的跨平台开发框架，由 DCloud（数字天堂）推出。其核心理念是“一次开发，多端发布”，允许开发者使用一套代码编译到 iOS、Android、H5、以及各种小程序（微信、支付宝、百度等）。

以下是 UniApp 知识点的全面总结，涵盖从基础架构到高级进阶内容：

---

### 1. 核心架构与原理
*   **跨端原理**:
    *   **解释器模式**: H5 端直接运行 Vue 代码；App 和小程序端通过桥接层（Bridge）将 Vue 语法转换为原生组件或小程序组件。
    *   **条件编译**: \`#ifdef\` / \`#endif\` 指令，用于针对不同平台编写特定代码。
*   **开发工具**:
    *   **HBuilderX**: 官方推荐 IDE，内置调试、打包、真机预览功能。
    *   **VS Code**: 配合 \`uni-app\` 插件使用，适合习惯 VS Code 的团队。
    *   **CLI 脚手架**: 支持命令行创建项目 (\`@dcloudio/uni-cli\`)，便于集成 CI/CD。
*   **Vue 版本**:
    *   目前主流为 **Vue 3** (Composition API)，性能更好，生态更新。
    *   部分老旧项目仍在使用 Vue 2 (Options API)。

---

### 2. 项目结构与配置
*   **目录结构**:
    *   \`pages/\`: 存放页面文件 (\`.vue\`)。
    *   \`components/\`: 存放公共组件。
    *   \`static/\`: 存放静态资源 (图片、字体等)。
    *   \`manifest.json\`: **核心配置文件**。定义 App 名称、图标、权限、启动页、各端特有配置。
    *   \`pages.json\`: **路由配置文件**。定义页面路径、导航栏样式、窗口表现、TabBar。
    *   \`App.vue\`: 应用入口，包含全局样式和生命周期。
    *   \`main.js\`: 应用初始化入口。
    *   \`uni.scss\`: 全局 SCSS 变量和混入。
*   **条件编译**:
    *   语法：\`#ifdef PLATFORM\` ... \`#endif\`。
    *   场景：不同平台的 API 差异、UI 适配、逻辑分支。

---

### 3. 页面与路由系统
*   **页面结构**: 每个 \`.vue\` 文件包含 \`<template>\`, \`<script>\`, \`<style>\`。
*   **页面生命周期**:
    *   \`onLoad(options)\`: 加载时触发，获取参数。
    *   \`onShow()\`: 显示时触发。
    *   \`onHide()\`: 隐藏时触发。
    *   \`onUnload()\`: 卸载时触发。
    *   \`onPullDownRefresh()\`: 下拉刷新。
    *   \`onReachBottom()\`: 触底加载。
*   **路由跳转**:
    *   \`uni.navigateTo()\`: 保留当前页，跳转到新页（有返回栈）。
    *   \`uni.redirectTo()\`: 关闭当前页，跳转到新页。
    *   \`uni.switchTab()\`: 切换到 Tab 页（只能配置在 pages.json 中）。
    *   \`uni.reLaunch()\`: 关闭所有页，打开新页。
    *   \`uni.navigateBack()\`: 返回上一页。
    *   **参数传递**: URL 参数 (\`options\`) 或对象传参。
    *   **事件总线**: 非父子组件通信 (\`uni.$emit\`, \`uni.$on\`)。

---

### 4. 组件系统
*   **原生组件**:
    *   如 \`<video>\`, \`<map>\`, \`<canvas>\`, \`<input>\` 等，需遵循特定规范（如必须放在父容器最底层）。
*   **Uni-UI 组件库**:
    *   官方提供的丰富组件集（按钮、表单、列表、弹窗等），自动适配多端样式。
    *   常用组件：\`uni-button\`, \`uni-form\`, \`uni-swipe-action\`, \`uni-popup\`, \`uni-nav-bar\`.
*   **自定义组件**:
    *   基于 Vue 组件机制开发，可复用性强。
    *   注意：组件内的 \`this\` 指向问题，以及 props 的单向数据流。
*   **插槽 (Slots)**:
    *   默认插槽、具名插槽，用于组件内容分发。

---

### 5. 样式与布局
*   **CSS 预处理器**: 支持 SCSS, Less, Stylus (推荐 SCSS)。
*   **响应式布局**:
    *   \`rpx\`: 响应式像素单位，根据屏幕宽度自动换算（750rpx = 屏幕宽度）。
    *   Flexbox: 主要布局方式，但需注意某些原生组件对 Flex 的支持限制。
*   **多端样式适配**:
    *   使用条件编译处理不同平台的样式差异。
    *   使用 \`uni.css\` 或 \`uni.scss\` 定义全局变量。
*   **动画**:
    *   CSS3 动画 (\`transition\`, \`animation\`)。
    *   \`uni.createAnimation()\` API 生成复杂动画。

---

### 6. 网络请求与数据管理
*   **网络请求**:
    *   \`uni.request()\`: 封装了原生的 HTTP 请求，支持 Promise。
    *   **拦截器**: 可在 \`main.js\` 或独立文件中设置请求/响应拦截器（统一添加 Token、错误处理）。
    *   **并发请求**: \`Promise.all\` 组合多个请求。
*   **状态管理**:
    *   **Vuex (Vue 2)** / **Pinia (Vue 3)**: 集中式状态管理。
    *   **uni.store**: 轻量级状态管理方案（类似 Vuex 但针对 uni-app 优化）。
    *   **本地缓存**: \`uni.setStorageSync()\`, \`uni.getStorageSync()\`。
*   **云开发 (Cloud Base)**:
    *   无需后端服务器，直接使用腾讯云能力（数据库、存储、云函数）。
    *   适合快速原型开发和中小型应用。

---

### 7. 设备与原生能力 (API)
*   **基础 API**:
    *   **用户信息**: \`uni.getUserProfile()\` (需授权)。
    *   **地理位置**: \`uni.getLocation()\`, \`uni.chooseLocation()\`.
    *   **媒体**: \`uni.chooseImage()\`, \`uni.uploadFile()\`, \`uni.previewImage()\`, \`uni.playVideo()\`.
    *   **支付**: \`uni.requestPayment()\` (微信支付、支付宝等)。
    *   **分享**: \`uni.share()\` (微信分享、朋友圈)。
    *   **扫码**: \`uni.scanCode()\`.
    *   **震动/蓝牙/NFC**: 需调用原生模块。
*   **原生插件**:
    *   当标准 API 无法满足需求时，可使用 **DCloud 插件市场** 中的原生插件（如地图、推送、支付、直播等）。
    *   也可自行开发原生插件（需 Android/iOS 开发经验）。

---

### 8. 性能优化
*   **列表渲染**:
    *   使用 \`v-for\` 时必须绑定 \`key\`。
    *   长列表使用虚拟滚动 (\`uni-list\` 自带优化) 或分页加载。
*   **图片优化**:
    *   压缩图片，使用 WebP 格式。
    *   懒加载 (\`lazy-load\` 属性)。
    *   避免大图直接嵌入。
*   **分包加载**:
    *   将大项目拆分为主包和分包，减少首次加载时间。
    *   配置 \`pages.json\` 中的 \`subPackages\`。
*   **减少重绘重排**:
    *   避免频繁修改 DOM，使用 CSS transform 代替 top/left。
    *   合理使用 \`wx:if\` vs \`display: none\` (在小程序中)。
*   **内存泄漏**:
    *   及时清除定时器 (\`clearInterval\`, \`clearTimeout\`)。
    *   移除不必要的事件监听器 (\`off\`, \`offGlobal\`)。

---

### 9. 真机调试与打包
*   **真机调试**:
    *   **HBuilderX**: 连接手机 USB 或使用 WiFi 调试。
    *   **DevTools**: 微信小程序开发者工具、Chrome DevTools (H5)。
    *   **远程调试**: 使用 \`vConsole\` 或 \`Eruda\` 查看控制台日志。
*   **打包流程**:
    *   **H5**: 编译为静态文件，部署到 Nginx/Apache。
    *   **小程序**: 上传至对应平台后台审核。
    *   **App**:
        *   使用 HBuilderX 进行云打包（免费额度有限）。
        *   或使用 **CLI + 原生 SDK** 进行本地打包（需要 Android Studio/Xcode 环境）。
        *   生成 APK/IPA 文件。

---

### 10. 进阶与生态
*   **Taro / uni-app 对比**: Taro 基于 React，uni-app 基于 Vue，两者各有优劣，uni-app 在国内小程序生态中占有率更高。
*   **混合开发**:
    *   在原生 App 中嵌入 H5 页面 (\`uni-webview\`)。
    *   在 H5 中调用原生能力。
*   **插件市场**:
    *   利用 DCloud 插件市场加速开发（如富文本编辑器、地图、图表、登录框等）。
*   **TypeScript 支持**:
    *   现代 uni-app 项目推荐使用 TypeScript，类型更安全，重构更方便。
*   **uni-app x**:
    *   新一代高性能渲染引擎，旨在接近原生体验（需关注最新文档）。

---

### 学习建议
1.  **先学 Vue**: 熟练掌握 Vue 3 的 Composition API、生命周期、指令等。
2.  **熟悉配置**: 深入理解 \`pages.json\` 和 \`manifest.json\` 的作用。
3.  **多端测试**: 养成在 H5、微信开发者工具、真机上同时测试的习惯。
4.  **阅读源码**: 尝试阅读官方示例代码或优秀开源项目的实现。
5.  **关注更新**: UniApp 迭代较快，定期查看官方文档和公告。

`,
  }),
  createDocRecord({
    id: 'doc-3',
    title: 'JavaScript 高级知识点全面总结',
    summary: '从执行上下文、异步机制、Proxy、性能优化到 Node.js 与 ES Next 的系统梳理。',
    tags: ['JavaScript', 'ESNext', 'Node.js'],
    createTime: '2026-04-15',
    content: `JavaScript 的高级知识点通常涉及语言底层机制、性能优化、架构设计以及现代工程化实践。为了给您提供一份全面且深度的总结，我将结合最新的 ECMAScript 标准（ES2024/ESNext）和浏览器/Node.js 运行机制进行梳理。

以下是 JavaScript **高级**知识点的全面总结：

### 1. 执行上下文与内存管理 (Execution Context & Memory)
*   **执行上下文栈 (Call Stack)**: 理解代码是如何被逐行调用的，同步代码的阻塞机制。
*   **作用域链 (Scope Chain) 深度解析**: 变量查找的完整路径，闭包如何“捕获”外部变量及其生命周期。
*   **垃圾回收机制 (GC)**:
    *   **标记 - 清除 (Mark-and-Sweep)**: V8 引擎的主流算法。
    *   **引用计数**: 早期算法，循环引用导致的内存泄漏问题。
    *   **分代回收 (Generational GC)**: 将对象分为新生代（短期存活）和老生代（长期存活），针对不同代使用不同算法优化性能。
    *   **内存泄漏排查**: 全局变量滥用、未清理的定时器/监听器、闭包持有大对象等场景及检测工具 (Chrome DevTools Memory Panel)。

### 2. 异步编程进阶 (Advanced Asynchronous Patterns)
*   **事件循环 (Event Loop) 深层原理**:
    *   宏任务 (MacroTask): \`setTimeout\`, \`setInterval\`, I/O, UI Rendering, \`script\`。
    *   微任务 (Microtask): \`Promise.then/catch/finally\`, \`queueMicrotask\`, \`MutationObserver\`, \`process.nextTick\` (Node.js)。
    *   **执行顺序**: 当前脚本 -> 清空所有微任务 -> 渲染 (UI) -> 执行一个宏任务 -> 循环。
*   **Generator 函数**:
    *   \`function*\`, \`yield\`, \`yield*\`。
    *   实现**协程 (Coroutines)**，手动控制函数暂停与恢复。
    *   用于流式处理数据、实现迭代器协议 (\`Iterator\`)。
*   **Async/Await 内部机制**:
    *   本质是 Generator + Promise 的语法糖。
    *   错误传播机制与 \`try...catch\` 的嵌套处理。
*   **并发控制**:
    *   \`Promise.allSettled\` vs \`Promise.all\` vs \`Promise.race\` vs \`Promise.any\`。
    *   **限流 (Concurrency Limit)**: 手动实现并发数限制（如同时只请求 5 个 API）。

### 3. 原型与面向对象的高级模式 (Advanced OOP & Patterns)
*   **原型链的极致利用**: 动态修改 \`__proto__\` 或 \`Object.setPrototypeOf\` 的影响（性能开销）。
*   **Class 高级特性**:
    *   **静态属性与方法** (\`static\`)。
    *   **私有字段** (\`#privateField\`) 和 **私有方法** (\`#privateMethod\`)，真正的封装。
    *   **访问器属性** (\`get\` / \`set\`) 与 \`Proxy\` 的结合。
*   **设计模式在 JS 中的应用**:
    *   **单例模式 (Singleton)**: 确保类只有一个实例。
    *   **工厂模式 (Factory)**: 创建对象的逻辑抽象。
    *   **观察者模式 (Observer/PubSub)**: 事件总线实现。
    *   **发布 - 订阅模式 (Pub/Sub)**: 解耦模块通信。
    *   **Mixin**: 混合多个类的功能。
    *   **策略模式 (Strategy)**: 动态切换算法。
*   **Module 高级用法**:
    *   **动态导入**: \`import()\` 返回 Promise，实现代码分割 (Code Splitting)。
    *   **命名空间导出** 与 **默认导出** 的陷阱。
    *   **Side Effects**: 处理副作用导入。

### 4. Proxy 与 Reflect (元编程 Meta-programming)
*   **Proxy 拦截器**:
    *   \`get\`: 属性读取拦截（响应式框架 Vue3 的核心）。
    *   \`set\`: 属性设置拦截。
    *   \`has\`: 检查属性是否存在。
    *   \`deleteProperty\`, \`ownKeys\`, \`apply\`, \`construct\` 等。
*   **Reflect 对象**:
    *   提供标准的操作对象的方法，与 Proxy 配合使用（如 \`Reflect.get(target, key)\`）。
    *   解决某些 Proxy 无法处理的边界情况。
*   **应用场景**: 响应式系统、数据验证、日志记录、虚拟代理、函数柯里化增强。

### 5. 性能优化与底层原理 (Performance & Optimization)
*   **V8 引擎优化**:
    *   **内联缓存 (Inline Caching)**: 加速属性访问。
    *   **隐藏类 (Hidden Classes)**: 优化对象存储结构，提升遍历速度。
    *   **去优化 (Deoptimization)**: 动态类型带来的性能波动。
*   **代码层面优化**:
    *   **防抖 (Debounce) 与 节流 (Throttle)**: 高频事件处理。
    *   **长任务拆分**: 使用 \`requestIdleCallback\` 或 \`Web Workers\` 避免主线程阻塞。
    *   **DOM 操作优化**: 文档碎片 (\`DocumentFragment\`)，减少重排 (Reflow) 和重绘 (Repaint)。
    *   **内存优化**: 及时释放大对象，避免闭包意外持有。
*   **Web Worker / SharedWorker**:
    *   多线程编程，将计算密集型任务移出主线程。
    *   消息传递机制 (\`postMessage\`, \`onmessage\`)。
    *   **SharedArrayBuffer** 与 **Atomics**: 真正的共享内存，跨 Worker 高效通信（需 CORS 头支持）。

### 6. 安全与沙箱 (Security & Sandboxing)
*   **XSS (跨站脚本攻击)**:
    *   原理与防御：输入过滤、输出转义、CSP (Content Security Policy)。
    *   \`innerHTML\` 的风险与替代方案。
*   **CSRF (跨站请求伪造)**: Token 验证机制。
*   **点击劫持 (Clickjacking)**: \`X-Frame-Options\`。
*   **Sandboxing**: 使用 \`iframe sandbox\` 或 \`eval\` 的限制（\`vm\` 模块）。
*   **CORS (跨域资源共享)**: 预检请求 (Preflight), \`Access-Control-Allow-Origin\`。

### 7. 正则表达式高级 (Advanced Regex)
*   **复杂匹配**: 非捕获组 \`(?:...)\`, 正向/负向先行断言 \`(?=...)\`, \`(?!)\`。
*   **Unicode 属性**: \`\\p{L}\`, \`\\p{N}\` 等，处理国际化字符。
*   **后向引用**: 反向引用已匹配的分组。
*   **性能陷阱**: 回溯爆炸 (Catastrophic Backtracking) 及其优化。

### 8. 模块化与构建工具生态 (Modern Tooling)
*   **Tree Shaking**: 静态分析移除未使用的代码（依赖 ES Modules）。
*   **Bundlers**: Webpack, Vite, Rollup, Esbuild 的工作原理（AST 转换、打包策略）。
*   **Transpilers**: Babel 插件开发原理（AST 遍历、生成）。
*   **TypeScript 基础**: 泛型、联合类型、交叉类型、条件类型、装饰器、Utility Types。虽然 TS 是类型系统，但它是现代 JS 高级开发的标配。

### 9. 浏览器高级 API (Browser APIs)
*   **Canvas & WebGL**: 图形绘制、3D 渲染基础。
*   **WebGL/WebGPU**: 下一代图形标准。
*   **Service Workers**: PWA 核心，离线缓存、后台同步、推送通知。
*   **Intersection Observer**: 高性能的视口元素检测（懒加载）。
*   **Fetch API & Streams**: 流式数据处理（大文件上传/下载）。
*   **Web Audio API**: 音频合成与分析。
*   **WebRTC**: 实时音视频通信。
*   **IndexedDB**: 浏览器端强大的 NoSQL 数据库。
*   **Storage API**: 区分 \`localStorage\`, \`sessionStorage\`, \`cookie\`, \`IndexedDB\`, \`Cache Storage\`。

### 10. Node.js 高级 (Server-side JS)
*   **事件驱动模型**: \`EventEmitter\` 的使用与扩展。
*   **Stream 流**: \`Readable\`, \`Writable\`, \`Duplex\`, \`Transform\`，处理大数据流。
*   **Cluster 模块**: 多进程负载均衡，利用多核 CPU。
*   **Child Process**: 子进程管理 (\`spawn\`, \`fork\`, \`exec\`)。
*   **Buffer**: 二进制数据处理。
*   **文件系统 (fs)**: 异步与同步操作，流式读写。
*   **HTTP/HTTPS 服务器**: 原生 \`http\` 模块与框架底层。

### 11. 前沿特性 (ES Next / TC39 Proposals)
*   **Temporal**: 取代 Date 的新日期时间库。
*   **Top-level await**: 允许在模块顶层直接使用 \`await\`。
*   **Decorators**: 正式进入标准，用于类元编程。
*   **Private Fields in Class**: 已在部分版本支持。
*   **Array Grouping**: \`Array.prototype.groupBy\`。
*   **WeakRef & FinalizationRegistry**: 处理弱引用和对象销毁后的清理回调。

### 学习建议
1.  **阅读源码**: 尝试阅读优秀开源库（如 Lodash, Vue3, React）的部分源码，理解其设计思路。
2.  **深入引擎**: 了解 V8 或 SpiderMonkey 的基本原理，有助于写出更高效的代码。
3.  **实战项目**: 尝试从零手写一个微型框架（如 mini-Vue, mini-React）或实现一个简单的构建工具，这是掌握高级知识的最佳途径。
4.  **关注规范**: 定期浏览 TC39 提案，了解未来语言的发展方向。

这份总结涵盖了从底层原理到上层架构的 JavaScript 高级知识体系。
`,
  }),
  createDocRecord({
    id: 'doc-4',
    title: 'JavaScript 核心知识点全面总结',
    summary: '从数据类型、函数、this、异步到 DOM 与现代特性的系统化基础梳理。',
    tags: ['JavaScript', '基础', 'ES6+'],
    createTime: '2026-04-15',
    content: `JavaScript 基础知识点非常广泛，为了给您提供一份全面且准确的总结，我将结合现有的知识体系以及最新的 ECMAScript 标准（ES6+）进行梳理。

以下是 JavaScript 核心知识点的全面总结：

### 1. 语言基础 (Basics)
*   **数据类型 (Data Types)**:
    *   **基本类型 (Primitive)**: \`String\`, \`Number\`, \`Boolean\`, \`Null\`, \`Undefined\`, \`Symbol\` (ES6), \`BigInt\` (ES2020)。
    *   **引用类型 (Reference)**: \`Object\` (包括数组 \`Array\`、函数 \`Function\`、日期 \`Date\`、正则 \`RegExp\` 等)。
    *   **类型检查**: \`typeof\` (注意 \`null\` 返回 object), \`instanceof\`, \`Object.prototype.toString.call()\`。
*   **变量声明**:
    *   \`var\`: 函数作用域，存在变量提升 (Hoisting)，可重复声明。
    *   \`let\`: 块级作用域，不存在变量提升（暂时性死区 TDZ），不可重复声明。
    *   \`const\`: 块级作用域，常量，必须初始化，引用地址不可变（但对象内容可变）。
*   **运算符**:
    *   算术、比较 (\`==\` vs \`===\`)、逻辑 (\`&&\`, \`||\`, \`??\` 空值合并)、位运算、扩展运算符 (\`...\`)。

### 2. 流程控制与结构 (Control Flow & Structures)
*   **条件判断**: \`if/else\`, \`switch\`, 三元运算符 \`? :\`。
*   **循环**: \`for\`, \`while\`, \`do...while\`, \`for...in\` (遍历对象属性), \`for...of\` (遍历可迭代对象如数组)。
*   **数据结构**:
    *   **数组 (Array)**: 常用方法 \`push\`, \`pop\`, \`shift\`, \`unshift\`, \`slice\`, \`splice\`, \`concat\`, \`map\`, \`filter\`, \`reduce\`, \`forEach\`, \`find\`, \`some\`, \`every\` 等。
    *   **对象 (Object)**: 属性访问 (\`.\` 和 \`[]\`), 解构赋值, 扩展运算符, \`Object.keys/values/entries\`。
    *   **集合 (ES6+)**: \`Set\` (去重), \`Map\` (键可以是任意类型)。

### 3. 函数 (Functions) - **核心重点**
*   **定义方式**:
    *   函数声明 \`function foo() {}\` (有提升)。
    *   函数表达式 \`const foo = function() {}\`。
    *   箭头函数 \`const foo = () => {}\` (无 \`this\`，无 \`arguments\`, 不能用作构造函数)。
*   **作用域与闭包 (Scope & Closures)**:
    *   **作用域链**: 全局作用域 -> 函数作用域 -> 块级作用域。
    *   **闭包**: 函数能够访问并记住其外部作用域的变量，即使外部函数已执行完毕。常用于数据私有化、柯里化 (Currying)。
*   **参数**: 默认参数，剩余参数 (\`...args\`)。
*   **高阶函数**: 接收函数作为参数或返回函数的函数 (如 \`map\`, \`filter\`, \`setTimeout\`, \`Promise.then\`)。

### 4. this 指向 (The 'this' Keyword)
*   **规则**:
    *   默认绑定：独立调用指向 \`window\` (非严格模式) 或 \`undefined\` (严格模式)。
    *   隐式绑定：对象方法调用，指向调用该方法的对象。
    *   显式绑定：使用 \`call\`, \`apply\`, \`bind\` 强制指定。
    *   new 绑定：构造函数调用，指向新创建的实例。
    *   箭头函数：不绑定自己的 \`this\`，继承外层作用域的 \`this\`。

### 5. 异步编程 (Asynchronous Programming)
*   **事件循环 (Event Loop)**: 理解宏任务 (Macrotask, 如 \`setTimeout\`, \`setInterval\`, I/O) 和微任务 (Microtask, 如 \`Promise\`, \`queueMicrotask\`, \`MutationObserver\`) 的执行顺序。
*   **回调函数 (Callback)**: 传统方式，易导致“回调地狱”。
*   **Promise**:
    *   状态：\`pending\`, \`fulfilled\`, \`rejected\`。
    *   方法：\`.then()\`, \`.catch()\`, \`.finally()\`。
    *   组合：\`Promise.all\`, \`Promise.race\`, \`Promise.allSettled\`, \`Promise.any\`。
*   **Async/Await**: ES8 引入，基于 Promise 的语法糖，使异步代码看起来像同步代码，配合 \`try...catch\` 处理错误。

### 6. 原型与面向对象 (Prototype & OOP)
*   **原型链**: 每个对象都有 \`__proto__\` (或 \`[[Prototype]]\`)，指向其构造函数的 \`prototype\`。查找属性时沿原型链向上查找。
*   **构造函数**: 使用 \`new\` 关键字创建实例。
*   **Class (ES6)**: 语法糖，简化了原型的写法 (\`class\`, \`extends\`, \`super\`, \`constructor\`, \`static\`)。
*   **模块化**:
    *   CommonJS (\`require\`, \`module.exports\`): Node.js 默认，同步加载。
    *   ES Modules (\`import\`, \`export\`): 浏览器和现代 Node.js 支持，静态分析，异步加载。

### 7. DOM 操作与事件 (DOM & Events)
*   **节点获取**: \`querySelector\`, \`getElementById\`, \`getElementsByClassName\` 等。
*   **节点操作**: 增删改查 (createElement, appendChild, removeChild, innerHTML, textContent)。
*   **事件模型**:
    *   事件流：捕获阶段 -> 目标阶段 -> 冒泡阶段。
    *   事件监听：\`addEventListener\` (推荐), \`onclick\` (旧式)。
    *   事件委托：利用冒泡原理，在父元素上统一监听子元素事件，提高性能。
    *   常见事件：\`click\`, \`submit\`, \`load\`, \`resize\`, \`scroll\`, \`input\`。
    *   阻止默认行为：\`event.preventDefault()\`。
    *   阻止冒泡：\`event.stopPropagation()\`。

### 8. BOM 与 浏览器 API (BOM & Browser APIs)
*   **Window 对象**: 浏览器窗口的全局对象。
*   **Location**: 页面 URL 信息 (\`href\`, \`search\`, \`hash\`)。
*   **History**: 浏览器历史记录 (\`pushState\`, \`replaceState\`, \`go\`, \`back\`, \`forward\`)。
*   **Storage**:
    *   \`localStorage\`: 永久存储，跨会话。
    *   \`sessionStorage\`: 仅当前会话有效。
    *   \`cookie\`: 较小容量，可发送给服务器。
*   **定时器**: \`setTimeout\`, \`setInterval\`, \`requestAnimationFrame\` (用于动画)。

### 9. 错误处理 (Error Handling)
*   **Try-Catch-Finally**: 捕获运行时错误。
*   **Throw**: 手动抛出错误。
*   **Error 对象**: 自定义错误类型。

### 10. 现代特性与最佳实践 (Modern Features & Best Practices)
*   **解构赋值**: 数组和对象的快速提取。
*   **模板字符串**: 反引号 \`\` \`Hello \${name}\` \`\` 支持多行和插值。
*   **可选链 (Optional Chaining)**: \`obj?.prop?.method()\` 防止 \`Cannot read property of undefined\`。
*   **空值合并 (Nullish Coalescing)**: \`val ?? defaultValue\` (仅在值为 null 或 undefined 时使用)。
*   **Strict Mode**: \`'use strict';\` 启用严格模式，减少隐性错误。
*   **防抖 (Debounce) 与 节流 (Throttle)**: 优化高频事件处理。

### 学习建议
1.  **先掌握基础**: 变量、数据类型、函数、作用域是地基。
2.  **深入理解异步**: 这是前端开发中最难也是最重要的部分之一。
3.  **动手实践**: 尝试用原生 JS 实现一些库的功能（如简单的 AJAX 封装、事件总线）。
4.  **关注框架**: 了解 React/Vue/Angular 之前，务必先精通原生 JS，因为框架底层都是这些概念。

`,
  }),


  
  createDocRecord({
    id: 'doc-5',
    title: 'HTML 核心知识点完全总结',
    summary: '从基础语法、语义化、表单、多媒体到 A11y 与性能优化的完整梳理。',
    tags: ['HTML', '语义化', 'A11y'],
    createTime: '2026-04-15',
    content: `HTML (HyperText Markup Language) 是构建网页的骨架和基础。它不是一种编程语言，而是一种**标记语言**。为了给您提供一份**完全且详细**的总结，我将从基础语法、核心标签、语义化、表单、多媒体、性能优化、无障碍访问（A11y）以及最新标准等多个维度进行梳理。

---

### 1. HTML 基础架构与语法
*   **文档类型声明**: \`<!DOCTYPE html>\` (必须放在第一行，告诉浏览器使用 HTML5 标准)。
*   **根元素**: \`<html>\`，包含 \`lang\` 属性指定语言 (\`<html lang="zh-CN">\`)。
*   **头部信息 (\`<head>\`)**:
    *   **元数据**: \`<meta charset="UTF-8">\` (字符集), \`<meta name="viewport" ...>\` (响应式视口), \`<meta description>\` (SEO 描述), \`<meta keywords>\`。
    *   **标题**: \`<title>\` (浏览器标签页显示的文字)。
    *   **资源链接**: \`<link rel="stylesheet">\` (CSS), \`<link rel="icon">\` (Favicon)。
    *   **脚本加载**: \`<script src="...">\` (通常放在 body 底部或使用 \`defer/async\`)。
    *   **其他**: \`<base>\`, \`<style>\`, \`<meta http-equiv>\`。
*   **主体内容 (\`<body>\`)**: 用户可见的内容区域。
*   **注释**: \`<!-- 注释内容 -->\` (不会在页面显示)。
*   **实体字符**: \`&lt;\`, \`&gt;\`, \`&amp;\`, \`&nbsp;\`, \`&quot;\` 等，用于显示特殊符号。
*   **空白处理**: 多个空格或换行在渲染时会被合并为一个空格。

---

### 2. 文本内容标签 (Text Content)
*   **块级元素 (Block-level)**: 独占一行，如 \`<div>\`, \`<p>\`, \`<h1>-<h6>\`, \`<ul>\`, \`<ol>\`, \`<table>\`, \`<section>\`, \`<article>\`。
*   **行内元素 (Inline)**: 不独占一行，如 \`<span>\`, \`<a>\`, \`<img>\`, \`<strong>\`, \`<em>\`。
*   **标题**: \`<h1>\` (最重要) 到 \`<h6>\` (最不重要)，层级结构对 SEO 至关重要。
*   **段落**: \`<p>\` 定义段落，注意不要嵌套 \`<p>\`。
*   **强调与引用**:
    *   \`<strong>\`: 语义上的重要/加粗 (屏幕阅读器重读)。
    *   \`<em>\`: 语义上的强调/斜体 (语气变化)。
    *   \`<mark>\`: 高亮标记。
    *   \`<blockquote>\`: 长引用。
    *   \`<q>\`: 短引用。
    *   \`<cite>\`: 引用作品标题。
    *   \`<abbr>\`: 缩写词 (配合 \`title\` 属性)。
    *   \`<address>\`: 联系信息。
*   **代码与预格式化**:
    *   \`<code>\`: 代码片段。
    *   \`<pre>\`: 保留空白和换行的预格式化文本。
    *   \`<kbd>\`: 键盘输入。
    *   \`<samp>\`: 计算机输出。
    *   \`<var>\`: 变量。
*   **列表**:
    *   \`<ul>\`: 无序列表 (项目符号)。
    *   \`<ol>\`: 有序列表 (数字/字母)。
    *   \`<li>\`: 列表项。
    *   \`<dl>\`, \`<dt>\`, \`<dd>\`: 定义列表 (术语/描述)。

---

### 3. 超链接与导航 (Links & Navigation)
*   **锚点链接**: \`<a href="url">text</a>\`。
    *   \`href\`: 目标地址 (相对路径/绝对路径/内部锚点 \`#id\`)。
    *   \`target\`: \`_self\` (当前), \`_blank\` (新窗口), \`_parent\`, \`_top\`。
    *   \`rel\`: \`noopener noreferrer\` (安全，防止新窗口劫持), \`nofollow\` (SEO), \`noreferrer\`。
    *   \`download\`: 触发下载而非跳转。
    *   \`ping\`: 通知服务器链接被点击。
*   **图像映射 (Image Map)**: \`<map>\` + \`<area>\` 定义图片上的可点击区域。
*   **面包屑导航**: 使用 \`<nav>\` 包裹，结合 \`<ul>\` 实现。

---

### 4. 图像与媒体 (Images & Media)
*   **图像**: \`<img src="..." alt="..." width="..." height="...">\`。
    *   **关键点**: \`alt\` 属性必须填写 (无障碍 + SEO)，避免空值。
    *   **现代格式**: WebP, AVIF (通过 \`<picture>\` 标签提供多格式回退)。
    *   **懒加载**: \`loading="lazy"\`。
    *   **响应式**: 使用 CSS 控制宽度，或使用 \`srcset\` 和 \`sizes\` 属性。
*   **多媒体**:
    *   **音频**: \`<audio controls src="...">\`，支持 \`loop\`, \`autoplay\`, \`muted\`, \`preload\`。
    *   **视频**: \`<video controls src="...">\`，支持 \`poster\` (封面图), \`width\`, \`height\`。
    *   **字幕**: \`<track kind="subtitles" srclang="en" label="English" src="...">\`。
    *   **来源**: \`<source src="..." type="...">\`。
*   **矢量图形**:
    *   \`<svg>\`: 可缩放矢量图形，支持 DOM 操作和 CSS 样式。
    *   \`<canvas>\`: 位图绘制，需通过 JS API (\`getContext('2d')\`) 操作。

---

### 5. 表单 (Forms) - **交互核心**
*   **基本结构**:
    *   \`<form action="..." method="GET/POST" enctype="multipart/form-data">\`。
    *   \`autocomplete\`: 自动补全开关。
    *   \`novalidate\`: 禁用浏览器默认验证。
*   **输入控件 (\`<input>\`)**:
    *   \`type\`: \`text\`, \`password\`, \`email\`, \`number\`, \`tel\`, \`url\`, \`date\`, \`time\`, \`datetime-local\`, \`color\`, \`range\`, \`file\`, \`checkbox\`, \`radio\`, \`submit\`, \`reset\`, \`button\`, \`hidden\`。
    *   **通用属性**: \`name\` (提交键名), \`value\`, \`placeholder\`, \`required\`, \`disabled\`, \`readonly\`, \`pattern\` (正则), \`min/max\`, \`step\`, \`multiple\`, \`checked\`, \`defaultChecked\`。
*   **其他表单元素**:
    *   \`<label for="id">\`: 关联输入框，提升可访问性。
    *   \`<textarea>\`: 多行文本。
    *   \`<select>\` / \`<option>\` / \`<optgroup>\`: 下拉菜单。
    *   \`<datalist>\`: 输入框的选项建议列表。
    *   \`<fieldset>\` / \`<legend>\`: 分组表单字段。
*   **验证与反馈**:
    *   原生约束验证 API (CVA): \`checkValidity()\`, \`reportValidity()\`。
    *   伪类选择器: \`:valid\`, \`:invalid\`, \`:required\`, \`:optional\`, \`:focus-within\`。

---

### 6. 表格 (Tables)
*   **结构**:
    *   \`<table>\`: 容器。
    *   \`<thead>\`, \`<tbody>\`, \`<tfoot>\`: 头部、主体、脚部。
    *   \`<tr>\`: 行。
    *   \`<th>\`: 表头单元格 (默认加粗居中)。
    *   \`<td>\`: 数据单元格。
*   **高级特性**:
    *   \`colspan\`: 跨列。
    *   \`rowspan\`: 跨行。
    *   \`scope\`: 指定 \`<th>\` 的作用范围 (column/row)，辅助屏幕阅读器。
*   **语义化**: 确保表格仅用于展示二维数据，而非布局。

---

### 7. 语义化标签 (Semantic HTML5)
*   **目的**: 提高代码可读性，利于 SEO，增强无障碍访问。
*   **主要标签**:
    *   \`<header>\`: 页面或区块的头部（Logo, 导航）。
    *   \`<nav>\`: 导航链接集合。
    *   \`<main>\`: 页面的主要内容（每个页面只能有一个）。
    *   \`<section>\`: 文档中的独立主题区域（通常有标题）。
    *   \`<article>\`: 独立、完整的内容（博客文章、新闻）。
    *   \`<aside>\`: 侧边栏或相关内容（广告、推荐）。
    *   \`<footer>\`: 页面或区块的底部（版权、联系方式）。
    *   \`<figure>\` / \`<figcaption>\`: 插图及其说明。
    *   \`<details>\` / \`<summary>\`: 可折叠的详情内容。
    *   \`<time>\`: 机器可读的时间/日期。
    *   \`<progress>\` / \`<meter>\`: 进度条和度量值。

---

### 8. 嵌入内容与框架 (Embedding & Frames)
*   **iframe**: 在页面中嵌入另一个页面 (\`<iframe src="...">\`)。
    *   属性：\`sandbox\` (限制权限), \`loading="lazy"\`, \`referrerpolicy\`。
    *   注意：SEO 负面影响，安全性风险。
*   **对象/插件**: \`<object>\`, \`<embed>\` (已逐渐被 iframe 或 HTML5 媒体标签取代)。
*   **Web Components (部分)**: 自定义元素的雏形。

---

### 9. 无障碍访问 (Accessibility / A11y)
*   **ARIA (Accessible Rich Internet Applications)**:
    *   \`role\`: 定义元素角色 (如 \`role="button"\`, \`role="alert"\`)。
    *   \`aria-label\`: 为不可见元素提供标签。
    *   \`aria-labelledby\`: 引用其他元素作为标签。
    *   \`aria-describedby\`: 引用描述性文本。
    *   \`aria-hidden="true"\`: 隐藏给屏幕阅读器。
    *   \`aria-expanded\`, \`aria-controls\`, \`aria-live\`: 动态状态管理。
*   **键盘导航**: 所有交互元素必须可通过 Tab 键访问，且焦点可见。
*   **对比度**: 文字与背景颜色对比度符合 WCAG 标准。
*   **替代文本**: 图片必须有 \`alt\`，装饰性图片 \`alt=""\`。

---

### 10. 性能优化与最佳实践
*   **HTML 压缩**: 移除多余空格、换行、注释。
*   **减少 DOM 节点**: 扁平化结构，减少嵌套层数。
*   **资源预加载**: \`<link rel="preload">\` (关键资源), \`<link rel="prefetch">\` (预测资源)。
*   **懒加载**: 图片、iframe、非首屏组件的 \`loading="lazy"\`。
*   **DNS 预解析**: \`<link rel="dns-prefetch" href="//example.com">\`。
*   **HTTP 缓存**: 配合 Meta 标签和服务器配置。
*   **结构化数据 (Schema.org)**: 使用 JSON-LD 或 Microdata 帮助搜索引擎理解内容。

---

### 11. 常见陷阱与注意事项
*   **嵌套错误**: 某些标签不能嵌套 (如 \`<p>\` 内不能放 \`<div>\`, \`<a>\` 内不能放 \`<a>\`)。
*   **自闭合标签**: HTML5 中 \`<br>\`, \`<hr>\`, \`<img>\`, \`<input>\` 等不需要写 \`/>\` (但写了也没错)。
*   **属性顺序**: 虽然不强制，但建议按逻辑排序 (type, id, class, name...)。
*   **XSS 攻击**: 不要直接将用户输入插入到 HTML 中，需转义。
*   **Doctype 缺失**: 会导致浏览器进入怪异模式 (Quirks Mode)，布局可能错乱。

---

### 12. 现代 HTML 趋势 (HTML5.2 / HTML5.3 / Future)
*   **HTML Living Standard**: W3C 停止发布新版本，改为由 WHATWG 维护“生活标准”，持续更新。
*   **新属性**: \`autocapitalize\`, \`enterkeyhint\`, \`inputmode\` (移动端键盘优化)。
*   **Form Validation Enhancements**: 更强大的原生验证规则。
*   **New Elements**: \`<dialog>\` (模态对话框), \`<template>\` (模板语法), \`<slot>\` (Web Components 插槽)。
*   **WebAssembly**: 虽然不属于 HTML，但常与 HTML 配合使用运行高性能模块。

---

### 学习建议
1.  **手写代码**: 尝试不使用任何框架，纯手写一个包含表单、列表、表格、媒体的静态页面。
2.  **检查语义**: 拿到一个页面，分析其是否使用了正确的语义化标签，而不是全是 \`<div>\`。
3.  **无障碍测试**: 尝试只用键盘操作页面，或使用屏幕阅读器（如 NVDA/VoiceOver）浏览你的页面。
4.  **开发者工具**: 熟练使用 Chrome DevTools 的 "Elements" 面板查看 DOM 结构和计算样式。
5.  **阅读规范**: 偶尔查阅 MDN Web Docs 或 W3C 官方规范，了解最新的属性变化。

这份总结涵盖了从基础到进阶的所有 HTML 核心知识点。
`,
  }),
  createDocRecord({
    id: 'doc-6',
    title: 'CSS 核心知识点详尽总结',
    summary: '从选择器、布局、响应式、动画到现代新语法与工程化实践的完整梳理。',
    tags: ['CSS', '布局', '响应式'],
    createTime: '2026-04-15',
    content: `CSS (Cascading Style Sheets) 是网页的“皮肤”和“骨骼”，负责控制网页的布局、样式和交互。为了给您提供一份**详尽且涵盖现代新语法**的总结，我将从基础机制、核心模块、现代布局、高级特性、动画性能、响应式设计以及工程化实践等多个维度进行梳理。

---

### 1. CSS 基础与核心机制
*   **选择器 (Selectors)**:
    *   **基本**: 标签 (\`div\`), 类 (\`.class\`), ID (\`#id\`), 通配符 (\`*\`)。
    *   **组合**: 后代 (\` \`), 子元素 (\`>\`), 相邻兄弟 (\`+\`), 通用兄弟 (\`~\`)。
    *   **属性选择器**: \`[type="text"]\`, \`[href^="https"]\`, \`[data-id$="123"]\`, \`[class|="btn"]\`。
    *   **伪类 (Pseudo-classes)**:
        *   状态：\`:hover\`, \`:active\`, \`:focus\`, \`:visited\`, \`:disabled\`。
        *   结构：\`:first-child\`, \`:last-child\`, \`:nth-child(n)\`, \`:nth-of-type(n)\`, \`:only-child\`, \`:not(selector)\`。
        *   UI状态：\`:checked\`, \`:enabled\`, \`:target\`, \`:placeholder-shown\`。
        *   **现代**: \`:has()\` (父级选择器，如 \`.parent:has(.child:hover) { ... }\`)。
    *   **伪元素 (Pseudo-elements)**:
        *   内容插入：\`::before\`, \`::after\`。
        *   文本修饰：\`::first-letter\`, \`::first-line\`。
        *   滚动条：\`::-webkit-scrollbar\` (浏览器私有)。
        *   **现代**: \`::selection\` (选中高亮), \`::backdrop\` (dialog/overlay背景), \`::part()\` / \`::theme()\` (Web Components)。
*   **盒模型 (Box Model)**:
    *   **组成**: Content, Padding, Border, Margin。
    *   **计算方式**: \`box-sizing: content-box\` (默认) vs \`border-box\` (推荐，简化计算)。
    *   **负边距**: 允许重叠。
    *   **外边距合并 (Margin Collapsing)**: 垂直方向相邻块级元素的 margin 会取最大值。
*   **层叠与优先级 (Cascading & Specificity)**:
    *   **权重计算**: 内联样式 (1000) > ID (100) > 类/属性/伪类 (10) > 标签/伪元素 (1)。
    *   **!important**: 强制覆盖（慎用）。
    *   **继承性**: 哪些属性会继承 (color, font-family)，哪些不会 (margin, border)。
    *   **作用域**: 样式表顺序，同权重后写的覆盖先写的。

---

### 2. 现代布局系统 (Layouts) - **核心重点**
*   **Flexbox (弹性盒子)**:
    *   **容器属性**: \`display: flex\`, \`flex-direction\` (row/col/reverse), \`justify-content\` (主轴对齐), \`align-items\` (交叉轴对齐), \`align-content\` (多行交叉轴), \`flex-wrap\` (换行), \`gap\` (间距)。
    *   **项目属性**: \`order\`, \`flex-grow\` (放大), \`flex-shrink\` (缩小), \`flex-basis\` (基准大小), \`flex\` (简写), \`align-self\` (单项覆盖)。
    *   **场景**: 导航栏、卡片列表、垂直居中、自适应高度。
*   **Grid (网格布局)**:
    *   **容器属性**: \`display: grid\`, \`grid-template-columns/rows\`, \`grid-template-areas\`, \`gap\`, \`grid-auto-flow\` (dense), \`justify-items/contents\`, \`align-items/contents\`。
    *   **项目属性**: \`grid-column/row\`, \`grid-column-start/end\`, \`grid-area\`, \`justify-self\`, \`align-self\`。
    *   **函数**: \`repeat()\`, \`minmax()\`, \`auto-fit\`, \`auto-fill\`。
    *   **场景**: 复杂页面布局、仪表盘、相册墙、响应式网格。
*   **Multi-column Layout (多列布局)**:
    *   \`column-count\`, \`column-gap\`, \`column-rule\`。
    *   **场景**: 报纸排版、长文章分栏。
*   **Float & Inline-block (传统布局)**:
    *   虽然逐渐被 Flex/Grid 取代，但仍需了解以维护旧代码及理解清除浮动 (\`clearfix\`)。

---

### 3. 现代视觉与特效 (Visuals & Effects)
*   **颜色与透明度**:
    *   **现代颜色空间**: \`hsl()\`, \`hwb()\`, \`lab()\`, \`lch()\`, \`oklch()\` (更自然的色彩调整)。
    *   **Alpha通道**: \`rgba()\`, \`hsla()\`, \`color-mix()\` (混合颜色)。
    *   **变量**: \`var(--custom-color)\`。
*   **渐变与背景**:
    *   \`linear-gradient\`, \`radial-gradient\`, \`conic-gradient\` (圆锥渐变)。
    *   \`background-image\`: 支持多层叠加。
    *   \`background-blend-mode\`: 背景混合模式。
    *   \`mask-image\` / \`-webkit-mask-image\`: 图像遮罩 (实现图片局部显示、文字镂空等)。
*   **阴影与模糊**:
    *   \`box-shadow\` (盒阴影)。
    *   \`text-shadow\` (文字阴影)。
    *   \`filter\`: \`blur()\`, \`grayscale()\`, \`sepia()\`, \`hue-rotate()\`, \`contrast()\`, \`brightness()\`。
    *   \`backdrop-filter\`: 背景模糊 (毛玻璃效果，需硬件加速)。
*   **形状与裁剪**:
    *   \`border-radius\`: 圆角，支持不对称圆角 (\`50% 0 50% 0\`)。
    *   \`clip-path\`: 任意形状裁剪 (\`polygon\`, \`circle\`, \`inset\`)。
    *   \`object-fit\`: 图片缩放模式 (\`cover\`, \`contain\`, \`fill\`, \`none\`, \`scale-down\`)。
    *   \`object-position\`: 图片定位。

---

### 4. 响应式设计 (Responsive Design)
*   **视口设置**: \`<meta name="viewport" content="width=device-width, initial-scale=1">\`。
*   **媒体查询 (Media Queries)**:
    *   基础：\`@media (min-width: 768px) { ... }\`。
    *   功能查询：\`@media (prefers-reduced-motion: reduce)\`, \`@media (prefers-color-scheme: dark)\`。
    *   组合查询：\`@media (min-width: 768px) and (orientation: landscape)\`。
*   **相对单位**:
    *   \`rem\`: 相对于根元素字体大小 (推荐用于间距、字体)。
    *   \`em\`: 相对于当前元素字体大小。
    *   \`vw/vh\`: 相对于视口宽高。
    *   \`vmin/vmax\`: 相对于视口较小/较大边。
    *   \`lh\`: 相对于当前行高 (行高相关)。
    *   \`ch\`: 相对于字符宽度。
    *   \`cap/ex\`: 基于特定字母高度。
*   **容器查询 (Container Queries)**:
    *   \`@container (min-width: 400px) { ... }\`。
    *   \`container-type\`, \`container-name\`。
    *   **优势**: 组件根据**父容器**大小变化，而非屏幕大小，更适合组件化开发。

---

### 5. 动画与过渡 (Animations & Transitions)
*   **过渡 (Transitions)**:
    *   \`transition-property\`, \`transition-duration\`, \`transition-timing-function\` (ease-in-out, cubic-bezier), \`transition-delay\`。
    *   用于简单的状态切换。
*   **关键帧动画 (Keyframes)**:
    *   \`@keyframes name { from { ... } to { ... } }\`。
    *   \`animation-name\`, \`animation-duration\`, \`animation-iteration-count\`, \`animation-direction\`, \`animation-fill-mode\` (forwards/backwards/both), \`animation-play-state\`。
*   **现代动画特性**:
    *   \`transform\`: \`translate\`, \`scale\`, \`rotate\`, \`skew\` (性能最佳，触发合成层)。
    *   \`will-change\`: 提示浏览器优化渲染。
    *   \`scroll-timeline\`: 基于滚动进度的动画 (Scroll-driven animations)。
    *   \`view-timeline\`: 基于元素在视口中的可见度触发动画。
    *   \`animation-timeline\`: 结合 scroll/view timeline。
    *   \`@property\`: 定义自定义属性的类型和初始值，允许对非标准属性做动画 (如 \`--my-color\`)。

---

### 6. 高级特性与新语法 (Modern CSS Features)
*   **CSS 变量 (Custom Properties)**:
    *   定义：\`--main-color: #f00;\`。
    *   使用：\`color: var(--main-color);\`。
    *   动态修改：通过 JS 修改 \`style.setProperty\`。
    *   嵌套作用域：变量在 DOM 树中继承。
*   **逻辑属性 (Logical Properties)**:
    *   替代物理属性，适配 RTL (从右向左) 语言。
    *   \`margin-inline-start\` vs \`margin-left\`。
    *   \`padding-block-end\` vs \`padding-bottom\`。
    *   \`text-align: start/end\` vs \`left/right\`。
    *   \`inset\` 系列 (\`top\`, \`right\`, \`bottom\`, \`left\` -> \`inset-block\`, \`inset-inline\`)。
*   **层叠层 (Layers)**:
    *   \`@layer base, components, utilities;\`。
    *   解决!important 和选择器权重混乱问题，明确样式优先级层级。
*   **嵌套 (Nesting)**:
    *   原生支持：\`button { color: red; &:hover { color: blue; } }\`。
    *   不再依赖 Sass/Less，直接写在 CSS 中。
*   **全局选择器**:
    *   \`@scope\`: 限制样式只在特定范围内生效。
    *   \`@starting-style\`: 定义动画开始时的状态。
*   **颜色混合**:
    *   \`color-mix(in srgb, red, blue 50%)\`。
*   **容器查询中的样式**:
    *   \`container-type: inline-size\`。

---

### 7. 无障碍访问 (Accessibility / A11y)
*   **对比度**: 确保文字与背景对比度符合 WCAG 标准。
*   **焦点管理**: \`outline\`, \`:focus-visible\` (仅键盘聚焦时显示轮廓)。
*   **隐藏元素**: \`display: none\` 和 \`visibility: hidden\` 的区别 (屏幕阅读器不读 \`display:none\`)。
*   **ARIA 配合**: \`aria-hidden\`, \`role\`, \`tabindex\`。
*   **减少运动**: \`@media (prefers-reduced-motion: reduce)\` 禁用动画。

---

### 8. 性能优化 (Performance)
*   **重排 (Reflow) 与 重绘 (Repaint)**:
    *   避免频繁修改 \`layout\` 属性 (width, height, top, left, margin)。
    *   优先使用 \`transform\` 和 \`opacity\` (触发合成层 Compositing)。
*   **GPU 加速**: 利用 \`will-change\` 和 \`transform\`。
*   **资源加载**:
    *   \`image-rendering\`: 控制图片缩放算法。
    *   \`content-visibility\`: 跳过不可见区域的布局和绘制 (大幅提速长列表)。
    *   \`contain-intrinsic-size\`: 为无尺寸容器预留空间。
*   **选择器性能**: 避免过长的后代选择器 (\`div div span p\`)，优先使用类名。

---

### 9. 预处理器与工具链 (Preprocessors & Tooling)
*   **预处理器**:
    *   **Sass/SCSS**: 最流行，支持嵌套、Mixin、函数、变量。
    *   **Less**: Bootstrap 常用。
    *   **Stylus**: 语法灵活。
    *   **PostCSS**: 插件化 CSS 处理 (自动添加前缀、Tailwind CSS 引擎)。
*   **原子化 CSS**:
    *   **Tailwind CSS**:  utility-first 风格，通过类名直接写样式。
    *   **UnoCSS**, **Windi CSS**: 更快的原子化引擎。
*   **CSS-in-JS**:
    *   Styled-components, Emotion, Tailwind's JIT mode。
*   **构建工具**:
    *   Vite, Webpack, Parcel 的 CSS 打包与压缩 (PurgeCSS 移除未使用样式)。

---

### 10. 常见陷阱与最佳实践
*   **重置 (Reset/Normalize)**: 使用 \`normalize.css\` 统一浏览器差异，或编写轻量级 Reset。
*   **BEM 命名法**: Block Element Modifier (如 \`.card__title--large\`)，避免样式冲突。
*   **Z-index 地狱**: 避免滥用 \`z-index\`，使用 \`position: sticky\` 或 \`layers\` 管理层级。
*   **硬编码像素**: 尽量使用相对单位 (\`rem\`, \`%\`, \`vh\`)。
*   **过度嵌套**: 保持 CSS 文件扁平化，利用 Nesting 但不过度。
*   **IE 兼容**: 现代开发通常不再考虑 IE，但需注意部分新特性 (如 \`:has\`, \`container queries\`) 的兼容性。

---

### 学习建议
1.  **动手实践**: 尝试用纯 CSS 还原一个复杂的 UI 设计稿（如 Apple 官网首页）。
2.  **掌握 Flex/Grid**: 这是现代布局的基石，必须熟练到肌肉记忆。
3.  **关注 MDN**: CSS 更新极快，MDN 是最权威的文档。
4.  **探索新特性**: 尝试使用 \`:has()\`, \`@container\`, \`scroll-timeline\` 等新语法重构旧代码。
5.  **性能测试**: 使用 Chrome DevTools 的 Performance 面板分析重排重绘。

这份总结涵盖了 CSS 从入门到精通的所有核心知识点及最新趋势。
`,
  }),
  createDocRecord({
    id: 'doc-7',
    title: 'Vue 3 核心知识点全面总结',
    summary: '系统梳理 Vue 3 的响应式、Composition API、组件能力，并对比 Vue 2 的关键差异。',
    tags: ['Vue 3', 'Vue 2', 'Composition API'],
    createTime: '2026-04-15',
    content: `Vue 3 是 Vue.js 的一次重大重构，旨在解决 Vue 2 在性能、TypeScript 支持、代码组织和功能扩展上的瓶颈。以下是对 **Vue 3 核心知识点的全面总结**，并附带了 **Vue 2 的重要知识点对比**（因为许多底层原理和迁移工作仍需了解 Vue 2）。

---

### 一、Vue 3 核心架构与特性 (必掌握)

#### 1. 响应式系统重构 (Reactivity System)
*   **原理**: 从 \`Object.defineProperty\` (Vue 2) 升级为 **ES6 Proxy**。
    *   **优势**:
        *   能监听对象属性的新增/删除 (\`obj.newProp = 1\`)。
        *   能监听数组索引的修改 (\`arr[0] = 1\`) 和长度变化。
        *   性能更好，无需遍历整个对象树。
*   **API**:
    *   \`ref(value)\`: 用于基本类型或保持引用，访问时需 \`.value\`。
    *   \`reactive(object)\`: 用于对象/数组，返回代理对象，直接访问属性。
    *   \`computed(getter)\`: 计算属性，依赖响应式数据自动更新。
    *   \`watch(source, callback)\`: 监听单个源。
    *   \`watchEffect(fn)\`: 立即执行函数，自动收集依赖。
    *   \`shallowRef\`, \`shallowReactive\`: 浅层响应（不递归嵌套对象），提升性能。
    *   \`readonly\`: 创建只读代理。
    *   \`toRaw\`: 获取原始对象。
    *   \`trigger/ref\`: 手动触发更新（极少用）。

#### 2. Composition API (组合式 API) - **核心变革**
*   **设计思想**: 将逻辑按“关注点”组织，而非按生命周期选项组织。解决 Vue 2 Options API 中逻辑分散、复用困难的问题。
*   **核心 Hook**:
    *   \`setup()\`: 组件入口函数，在 \`beforeCreate\` 之前执行。可返回 render 函数或响应式数据。
    *   \`onMounted\`, \`onUpdated\`, \`onUnmounted\` 等生命周期钩子。
    *   \`provide\` / \`inject\`: 祖先组件向后代提供数据（依赖注入）。
*   **逻辑复用**:
    *   **Composables (组合式函数)**: 如 \`useMouse\`, \`useFetch\`。通过提取 \`setup\` 中的逻辑，实现比 Mixins 更清晰的复用（无命名冲突，显式依赖）。
    *   **Mixin vs Composable**: Mixins 存在来源不明、命名冲突问题；Composables 通过解构显式导入，更透明。

#### 3. 模板语法与指令
*   **基础指令**: \`v-if\`, \`v-else-if\`, \`v-else\`, \`v-for\` (必须配合 \`v-if\` 使用), \`v-bind\` (\`:\`), \`v-on\` (\`@\`), \`v-model\` (双向绑定)。
*   **v-model 升级**:
    *   支持多模型绑定：\`<input v-model:[prop]="val" />\`。
    *   支持自定义修饰符。
    *   组件级 \`v-model\` 默认 prop 为 \`modelValue\`，事件为 \`update:modelValue\` (可通过 \`modelModifiers\` 配置)。
*   **v-slot (插槽) 升级**:
    *   简写语法 \`#slotName\` (如 \`<template #header>\` 代替 \`<template v-slot:header>\`)。
    *   具名插槽和作用域插槽更灵活。
    *   动态插槽名：\`<template #[dynamicSlot]>\`。
*   **v-textcontent**: 更安全，防止 XSS。
*   **Fragment (片段)**: 组件根节点不再限制为单个标签，可直接包含多个同级元素。
*   **Teleport (传送门)**: 将 DOM 节点移动到页面其他位置（如模态框、Toast），常用于解决层级覆盖问题。
*   **Suspense**: 异步组件加载的占位符（配合异步组件使用）。

#### 4. 组件系统 (Components)
*   **Props 验证**: 更严格的类型检查（基于 TypeScript 或运行时检查）。
*   **Emits 定义**: 必须显式声明 \`emits\` 选项，否则可能报错或警告。
*   **Slots 透传**: 自动透传属性到内部组件的默认插槽中（除非 \`inheritAttrs: false\`）。
*   **Async Components**: \`defineAsyncComponent()\` 替代 \`resolve()\`，支持懒加载和错误处理。
*   **Teleport**: 见上文。
*   **Suspense**: 见上文。

#### 5. 全局 API 与插件
*   **应用实例 (App Instance)**: \`createApp(App)\` 取代 \`new Vue()\`。
*   **全局 API 隔离**: 全局 API (如 \`app.config.globalProperties\`) 不再污染原型，而是挂载在 App 实例上。
*   **内置组件**:
    *   \`<Teleport>\`: 传送门。
    *   \`<Suspense>\`: 异步边界。
    *   \`<KeepAlive>\`: 缓存组件状态 (支持 \`include\`, \`exclude\`, \`max\` 属性)。
    *   \`<Transition>\`: 过渡动画 (支持 \`mode="out-in"\`, \`appear\`)。
    *   \`<TransitionGroup>\`: 列表过渡 (需包裹在 \`<ul>\` 等容器内，且列表项必须有 \`key\`)。

#### 6. TypeScript 支持
*   **原生 TS 支持**: Vue 3 源码完全用 TS 编写，类型推导更精准。
*   **Setup Script**: 支持 \`<script setup lang="ts">\` 语法糖，减少样板代码，自动推断类型。
*   **Props & Emits 类型**: 可使用 \`defineProps<{ name: string }>()\` 或 TS 接口定义。

#### 7. 性能优化
*   **静态提升 (Static Hoisting)**: 编译时识别不变动的 DOM 节点，直接提升为常量。
*   **Patch Flags**: 标记动态节点，Diff 算法只比较这些节点，跳过静态部分。
*   **Tree Shaking**: 未使用的 API 不会被打包进最终产物。
*   **SSR 优化**: Hydration 过程更快，支持流式渲染 (Streaming SSR)。

---

### 二、Vue 2 重要知识点 (回顾与迁移参考)

虽然 Vue 3 是主流，但维护旧项目或理解演进历史仍需掌握 Vue 2。

#### 1. Options API (选项式 API)
*   **结构**: \`data\`, \`methods\`, \`computed\`, \`watch\`, \`mounted\`, \`created\`, \`props\`, \`emits\` (Vue 2.4+) 等选项对象。
*   **缺点**: 逻辑分散，难以复用，大组件难以维护。

#### 2. 响应式原理 (Object.defineProperty)
*   **机制**: 劫持 getter/setter。
*   **局限性**:
    *   **无法监听对象属性的添加/删除**: 需用 \`Vue.set(obj, key, val)\` 或 \`Vue.delete(obj, key)\`。
    *   **无法监听数组索引/长度**: 需用 \`this.$set\` 或替换整个数组。
    *   **初始化耗时**: 需递归遍历所有属性。

#### 3. 生命周期钩子
*   **顺序**: \`beforeCreate\` -> \`created\` -> \`beforeMount\` -> \`mounted\` -> \`beforeUpdate\` -> \`updated\` -> \`beforeDestroy\` -> \`destroyed\`。
*   **注意**: Vue 3 中 \`beforeDestroy\` 改为 \`beforeUnmount\`，\`destroyed\` 改为 \`unmounted\`。

#### 4. 组件通信
*   **Props Down**: 父传子。
*   **Events Up**: 子传父 (\`$emit\`)。
*   **Provide/Inject**: 祖先传后代。
*   **Event Bus ($emit/$on)**: Vue 2 中常用的跨组件通信，Vue 3 已移除，推荐 Pinia/Vuex 或自定义事件总线。
*   **Vuex**: 状态管理库 (Mutation, Action, Getter, Module)。Vue 3 推荐使用 **Pinia** (更轻量、TS 友好)，但 Vuex 4.x 仍可用。

#### 5. 模板与指令
*   **单根节点限制**: 组件模板只能有一个根元素。
*   **v-model**: 默认 prop 为 \`value\`，事件为 \`input\`。
*   **v-for 优先级**: \`v-for\` 优先级高于 \`v-if\` (不建议混用)。
*   **过滤器 (Filters)**: \`{{ msg | capitalize }}\`。**Vue 3 已移除过滤器**，改用表达式或方法。

#### 6. 指令细节
*   **v-model**: 支持修饰符 \`.lazy\`, \`.number\`, \`.trim\`。
*   **v-on**: \`@click\`, \`@keyup.enter\` 等修饰符。
*   **v-show**: 切换 \`display: none\`。
*   **v-html**: 渲染 HTML。

#### 7. 插件与全局 API
*   **安装插件**: \`Vue.use(MyPlugin)\`。
*   **全局属性**: \`Vue.prototype.$http = ...\` (Vue 3 中改为 \`app.config.globalProperties\`)。
*   **混入 (Mixins)**: 逻辑复用方式，存在命名冲突风险。

---

### 三、Vue 2 vs Vue 3 关键差异对照表

| 特性 | Vue 2 | Vue 3 |
| :--- | :--- | :--- |
| **响应式原理** | \`Object.defineProperty\` | \`Proxy\` (更强大，性能更好) |
| **API 风格** | Options API (主要) | Composition API (主要) + Options API (兼容) |
| **组件根节点** | 必须单个 | 允许 Fragment (多个) |
| **生命周期** | \`beforeDestroy\`, \`destroyed\` | \`beforeUnmount\`, \`unmounted\` |
| **v-model** | \`value\` / \`input\` | \`modelValue\` / \`update:modelValue\` (可配置) |
| **过滤器** | 支持 (\`| filter\`) | **已移除** (改用表达式) |
| **事件总线** | \`$on\`, \`$off\`, \`$once\` | **已移除** (建议用 mitt 或 Pinia) |
| **Teleport** | 不支持 | 支持 (\`<Teleport>\`) |
| **Suspense** | 不支持 | 支持 (异步组件加载) |
| **TypeScript** | 支持一般 | 深度集成，类型推导完美 |
| **性能** | 较好 | 更快 (静态提升，Patch Flags) |
| **Bundle Size** | ~28KB (gzip) | ~16KB (gzip) |
| **状态管理** | Vuex | Pinia (推荐) / Vuex 4 |

---

### 四、学习路径建议

1.  **基础阶段**:
    *   熟练掌握 Vue 3 的 **Options API** (为了兼容旧项目和快速上手)。
    *   理解 **Composition API** 的核心概念 (\`setup\`, \`ref\`, \`reactive\`, \`computed\`, \`watch\`)。
    *   掌握 **Template 语法** (v-if, v-for, v-bind, v-on, v-model, v-slot)。
    *   熟悉 **生命周期** 和 **组件通信** (Props, Emits, Provide/Inject)。

2.  **进阶阶段**:
    *   深入 **Composition API** 模式，学会编写 **Composables** (如 \`useLocalStorage\`, \`useFetch\`)。
    *   掌握 **TypeScript** 与 Vue 3 的结合 (\`<script setup lang="ts">\`)。
    *   学习 **Pinia** 进行状态管理。
    *   理解 **Vue Router 4** (Vue 3 配套路由)。

3.  **高级/工程化**:
    *   掌握 **Teleport**, **Suspense**, **KeepAlive** 等高级组件。
    *   学习 **SSR** (Nuxt 3) 或 **SSG**。
    *   了解 **性能优化** 技巧 (虚拟滚动，按需加载)。
    *   熟悉 **Vite** 构建工具 (Vue 3 官方推荐)。

4.  **迁移与维护**:
    *   了解 **Vue 2 到 Vue 3 的迁移指南** (Migration Build)。
    *   知道如何处理 \`filters\`, \`event bus\`, \`mixins\` 等废弃特性。

这份总结涵盖了 Vue 3 的所有核心知识点以及 Vue 2 的关键遗产。
`,
  }),
  createDocRecord({
    id: 'doc-8',
    title: 'AJAX 知识点全面总结',
    summary: '从 XHR、Fetch、Axios 到 CORS、安全性、性能优化与工程化实践的系统梳理。',
    tags: ['AJAX', 'Fetch', 'Axios'],
    createTime: '2026-04-15',
    content: `AJAX (Asynchronous JavaScript and XML) 是前端开发中实现**异步通信**的核心技术，它允许网页在不重新加载整个页面的情况下，与服务器交换数据并更新部分网页内容。

虽然现代开发中常直接使用 \`fetch\` API 或框架（如 Axios），但理解 AJAX 的底层原理、历史演进和完整知识体系对于解决网络请求问题、优化性能和调试至关重要。

以下是 AJAX 知识点的全面总结：

---

### 1. 核心概念与定义
*   **全称**: Asynchronous JavaScript and XML。
*   **本质**: 一种**编程技术**，而非单一的技术。它结合了 HTML/CSS、DOM、JavaScript 和 **XMLHttpRequest** (或 Fetch)。
*   **核心特征**:
    *   **异步 (Asynchronous)**: 请求发出后，浏览器不阻塞后续代码执行，通过回调处理结果。
    *   **局部刷新**: 只更新页面的一部分，提升用户体验。
    *   **无刷新交互**: 用户无需等待整页重载。
*   **数据格式**: 早期主要用 XML，现在主流使用 **JSON** (轻量、易解析)，也可以是文本、HTML片段等。

---

### 2. 历史演进与技术栈

#### A. XMLHttpRequest (XHR) - 经典方案
*   **地位**: AJAX 技术的鼻祖，IE5+ 引入，所有现代浏览器支持。
*   **特点**:
    *   基于对象的事件驱动模型。
    *   支持同步 (\`async=false\`) 和异步 (\`async=true\`)，**强烈建议始终使用异步**。
    *   状态码管理 (\`readyState\`, \`status\`)。
*   **生命周期**:
    1.  \`OPEN\`: 初始化连接。
    2.  \`SEND\`: 发送请求。
    3.  \`HEADERS_RECEIVED\`: 接收响应头。
    4.  \`LOADING\`: 接收响应体。
    5.  \`DONE\`: 请求完成。

#### B. Fetch API - 现代标准
*   **地位**: W3C 标准，替代 XHR 的新接口。
*   **优势**:
    *   基于 **Promise**，语法更简洁，链式调用。
    *   内置流式传输支持 (Streams)。
    *   原生支持 AbortController (取消请求)。
*   **劣势**:
    *   **默认不抛出错误**: HTTP 4xx/5xx 不会 reject Promise，需手动检查 \`response.ok\`。
    *   **不支持进度监听**: 无法直接监听上传/下载进度 (需用 XHR 或自定义)。
    *   **默认不携带 Cookie**: 需设置 \`credentials: 'include'\`。

#### C. Axios - 第三方库 (工业界首选)
*   **地位**: 基于 Promise 的 HTTP 客户端，兼容浏览器和 Node.js。
*   **核心特性**:
    *   **拦截器 (Interceptors)**: 统一处理请求头、响应数据、错误处理。
    *   **自动转换**: 自动将 JSON 对象转为字符串，或将响应 JSON 转为对象。
    *   **请求取消**: 内置 CancelToken (旧版) 或 AbortController (新版)。
    *   **超时控制**: 原生支持 \`timeout\`。
    *   **FormData/XHR 支持**: 完美支持文件上传和表单提交。

---

### 3. 详细知识点拆解

#### 3.1 请求方法 (HTTP Methods)
*   **GET**: 获取资源，参数在 URL 中，有长度限制，幂等。
*   **POST**: 提交数据，参数在 Body 中，非幂等，常用于创建资源。
*   **PUT**: 更新资源，完全替换，幂等。
*   **PATCH**: 部分更新资源，幂等。
*   **DELETE**: 删除资源，幂等。
*   **HEAD**: 只获取响应头，不获取 Body。
*   **OPTIONS**: 预检请求 (CORS 跨域时触发)。

#### 3.2 请求配置 (Headers & Config)
*   **Content-Type**:
    *   \`application/json\`: 发送 JSON 数据 (Axios 默认)。
    *   \`application/x-www-form-urlencoded\`: 传统表单格式。
    *   \`multipart/form-data\`: 文件上传 (需配合 FormData)。
*   **Accept**: 告诉服务器期望返回的数据类型 (如 \`application/json\`)。
*   **Authorization**: 认证令牌 (Bearer Token, Basic Auth)。
*   **Custom Headers**: 传递业务特定信息 (如 \`X-Request-ID\`)。

#### 3.3 响应处理 (Response Handling)
*   **状态码 (Status Codes)**:
    *   \`1xx\`: 信息提示。
    *   \`2xx\`: 成功 (\`200 OK\`, \`201 Created\`, \`204 No Content\`)。
    *   \`3xx\`: 重定向 (\`301\`, \`302\`, \`304 Not Modified\`)。
    *   \`4xx\`: 客户端错误 (\`400 Bad Request\`, \`401 Unauthorized\`, \`403 Forbidden\`, \`404 Not Found\`)。
    *   \`5xx\`: 服务端错误 (\`500 Internal Server Error\`, \`502 Bad Gateway\`)。
*   **响应结构**:
    *   \`status\`: 状态码。
    *   \`statusText\`: 状态文本。
    *   \`headers\`: 响应头对象。
    *   \`data\`: 响应体 (已解析)。
    *   \`config\`: 请求配置。

#### 3.4 异步编程模式
*   **Callback Hell**: 嵌套回调，难以维护 (XHR 时代常见)。
*   **Promises**: 解决回调地狱，提供 \`.then()\`, \`.catch()\`, \`.finally()\`。
*   **Async/Await**: ES7 语法糖，让异步代码像同步代码一样书写，可读性最强。
    \`\`\`javascript
    try {
      const res = await fetch('/api/data');
      if (!res.ok) throw new Error('Network error');
      const data = await res.json();
    } catch (err) {
      console.error(err);
    }
    \`\`\`

#### 3.5 高级功能
*   **请求取消**:
    *   XHR: \`xhr.abort()\`。
    *   Fetch: \`AbortController\` (信号机制)。
    *   Axios: \`CancelToken\` 或 \`AbortController\`。
*   **请求重试 (Retry)**: 针对网络波动或 5xx 错误的自动重试策略 (指数退避)。
*   **请求节流/防抖**: 避免频繁触发请求 (如搜索框输入)。
*   **并发控制**: 同时发起多个请求，控制并发数 (如 \`Promise.all\`, \`Promise.allSettled\`, 限流队列)。
*   **进度监听**:
    *   XHR: \`onprogress\` 事件。
    *   Fetch: 需结合 \`ReadableStream\` 手动计算。
    *   Axios: \`onUploadProgress\`, \`onDownloadProgress\`。

---

### 4. 安全性与跨域 (CORS)

#### 4.1 CORS (Cross-Origin Resource Sharing)
*   **同源策略**: 浏览器限制不同源 (协议/域名/端口) 之间的脚本访问。
*   **CORS 机制**: 服务器通过响应头允许跨域。
    *   \`Access-Control-Allow-Origin\`: 允许的源 (可用 \`*\` 或具体域名)。
    *   \`Access-Control-Allow-Methods\`: 允许的 HTTP 方法。
    *   \`Access-Control-Allow-Headers\`: 允许的自定义头。
    *   \`Access-Control-Allow-Credentials\`: 是否允许携带 Cookie。
*   **预检请求 (Preflight)**:
    *   当请求包含非简单头 (如 \`Authorization\`) 或使用非 GET/POST 方法时，浏览器先发送 \`OPTIONS\` 请求。
    *   若服务器未正确响应预检，主请求会被阻断。

#### 4.2 安全漏洞防护
*   **XSS (跨站脚本攻击)**:
    *   防止将用户输入直接插入 DOM。
    *   设置 \`Content-Security-Policy\` (CSP) 响应头。
*   **CSRF (跨站请求伪造)**:
    *   利用用户的登录态发起恶意请求。
    *   **防御**: 使用 CSRF Token (放在 Header 或 Form 中), SameSite Cookie 属性, Referer 校验。
*   **敏感信息泄露**:
    *   不要在 URL 中传递密码或 Token。
    *   使用 HTTPS 加密传输。

---

### 5. 性能优化

*   **缓存策略**:
    *   **HTTP 缓存**: \`Cache-Control\`, \`ETag\`, \`Last-Modified\`。
    *   **Service Worker**: 离线缓存和优先缓存。
    *   **内存缓存**: 前端框架级别的请求缓存 (如 React Query, Vue Query)。
*   **压缩传输**:
    *   Gzip / Brotli 压缩 (服务器端开启)。
    *   图片 WebP/AVIF 格式。
*   **连接复用**: HTTP/2 多路复用，减少 TCP 握手次数。
*   **按需加载**: 路由级拆分，组件懒加载。
*   **请求合并**: 将多次小请求合并为一次大请求 (Batching)。

---

### 6. 常见问题与调试

*   **CORS 报错**: 检查服务器响应头配置。
*   **403 Forbidden**: 权限不足，Token 过期或缺少 CSRF Token。
*   **404 Not Found**: 接口路径错误。
*   **500 Internal Server Error**: 后端代码异常，查看后端日志。
*   **Network Error**: 网络断开，DNS 解析失败，或 CORS 预检失败。
*   **调试工具**:
    *   **Chrome DevTools -> Network**: 查看请求详情、Payload、Headers、Timing。
    *   **Console**: 打印请求和响应数据。
    *   **Postman / Apifox**: 独立测试接口。

---

### 7. 最佳实践总结

1.  **选择工具**:
    *   简单场景: 原生 \`fetch\`。
    *   复杂项目: **Axios** (生态丰富，拦截器强大)。
    *   数据请求 + 状态管理: **React Query** / **Vue Query** / **SWR** (推荐，处理缓存、重试、轮询)。
2.  **统一封装**:
    *   创建统一的请求实例 (Base Instance)。
    *   配置默认 \`baseURL\`, \`timeout\`, \`headers\`。
    *   全局拦截器处理 Token 注入、错误统一提示 (Toast)、401 跳转登录。
3.  **错误处理**:
    *   区分网络错误、业务错误、系统错误。
    *   给用户友好的提示，而不是直接抛出原始错误。
4.  **TypeScript 支持**:
    *   定义清晰的接口类型 (Interface/Type)。
    *   泛型支持 (Generic) 以推导返回值类型。
5.  **可访问性 (A11y)**:
    *   加载中显示骨架屏或 Loading 动画。
    *   错误时提供“重试”按钮。

---

### 8. 代码示例对比

#### 方式一：XMLHttpRequest (老旧)
\`\`\`javascript
const xhr = new XMLHttpRequest();
xhr.open('GET', '/api/users', true);
xhr.setRequestHeader('Content-Type', 'application/json');

xhr.onload = function () {
  if (xhr.status === 200) {
    const data = JSON.parse(xhr.responseText);
    console.log(data);
  } else {
    console.error('Error:', xhr.statusText);
  }
};

xhr.onerror = function () {
  console.error('Network Error');
};

xhr.send();
\`\`\`

#### 方式二：Fetch API (现代原生)
\`\`\`javascript
fetch('/api/users', {
  method: 'GET',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include' // 携带 Cookie
})
.then(response => {
  if (!response.ok) throw new Error('HTTP error! status: ' + response.status);
  return response.json();
})
.then(data => console.log(data))
.catch(error => console.error('Fetch error:', error));
\`\`\`

#### 方式三：Axios (推荐)
\`\`\`javascript
import axios from 'axios';

// 创建实例
const api = axios.create({
  baseURL: '/api',
  timeout: 5000,
});

// 请求拦截器
api.interceptors.request.use(config => {
  config.headers.Authorization = 'Bearer ' + token;
  return config;
});

// 响应拦截器
api.interceptors.response.use(
  response => response.data,
  error => {
    if (error.response.status === 401) {
      // 跳转到登录
    }
    return Promise.reject(error);
  }
);

// 使用
async function getUsers() {
  try {
    const res = await api.get('/users');
    return res;
  } catch (err) {
    console.error(err);
  }
}
\`\`\`

这份总结涵盖了从底层原理到工程化实践的所有 AJAX 知识点。
`,
  }),
]
