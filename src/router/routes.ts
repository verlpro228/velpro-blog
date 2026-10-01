import type { RouteRecordRaw } from 'vue-router'

export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('@/layout/BaseLayout.vue'),
    meta: {
      title: '首页',
    },
    children: [
      {
        path: '',
        name: 'home',
        component: () => import('@/views/HomeView.vue'),
        meta: {
          title: '首页',
        },
      },
      {
        // :id 可选：/knowledge 为知识库首页，/knowledge/doc-xxx 为单篇文章（独立 URL，便于收录与分享）
        path: 'knowledge/:id?',
        name: 'knowledge',
        component: () => import('@/views/KnowledgeView.vue'),
        meta: {
          title: '知识库',
          // 导航高亮用的路径：带 :id 时 route.path 会变长，不能用它直接比对
          navPath: '/knowledge',
          description: '前端技术知识库：React、Vue、CSS、JavaScript、网络与工程化等核心知识点系统梳理，支持模糊检索、AI 答疑与多格式导出。',
        },
      },
      {
        path: 'archive',
        name: 'archive',
        component: () => import('@/views/ArchiveView.vue'),
        meta: {
          title: '归档',
          description: '全部已发布文档的时间线归档，按年份回看每一篇技术沉淀。',
        },
      },
      {
        path: 'guestbook',
        name: 'guestbook',
        component: () => import('@/views/GuestbookView.vue'),
        meta: {
          title: '留言板',
          description: '访客留言板：对站点、文章与项目的任何想法，欢迎在这里留下你的声音。',
        },
      },
      {
        path: 'links',
        name: 'links',
        component: () => import('@/views/LinksView.vue'),
        meta: {
          title: '友情链接',
          description: '友情链接与申请方式：收录朋友们的技术博客与站点。',
        },
      },
      {
        path: 'projects',
        name: 'projects',
        component: () => import('@/views/ProjectsView.vue'),
        meta: {
          title: '项目展示',
          description: '个人项目作品集：企业级全栈平台、UniApp 多端应用与 AI 产品的技术方案与实现细节。',
        },
      },
      {
        path: 'about',
        name: 'about',
        component: () => import('@/views/AboutView.vue'),
        meta: {
          title: '个人介绍',
          description: '前端开发工程师个人介绍：专业技能、工作经验、项目经历、教育背景与技术成长路径。',
        },
      },
    ],
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/LoginView.vue'),
    meta: {
      title: '登录',
      noindex: true,
    },
  },
  {
    path: '/admin',
    component: () => import('@/layout/AdminLayout.vue'),
    meta: {
      title: '后台管理',
      requiresAuth: true,
      // 子路由通过 meta 合并继承，后台全部页面都不进搜索引擎索引
      noindex: true,
    },
    children: [
      {
        path: 'dashboard',
        name: 'dashboard',
        component: () => import('@/views/admin/DashboardView.vue'),
        meta: {
          title: '数据看板',
          requiresAuth: true,
        },
      },
      {
        path: 'editor',
        name: 'editor',
        component: () => import('@/views/admin/EditorView.vue'),
        meta: {
          title: '文档管理',
          requiresAuth: true,
        },
      },
      {
        path: 'projects',
        name: 'projects-admin',
        component: () => import('@/views/admin/ProjectsAdminView.vue'),
        meta: {
          title: '项目管理',
          requiresAuth: true,
        },
      },
      {
        path: 'profile',
        name: 'profile-admin',
        component: () => import('@/views/admin/ProfileAdminView.vue'),
        meta: {
          title: '介绍管理',
          requiresAuth: true,
        },
      },
      {
        path: 'settings',
        name: 'settings',
        component: () => import('@/views/admin/SettingsView.vue'),
        meta: {
          title: '账号设置',
          requiresAuth: true,
        },
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/NotFoundView.vue'),
    meta: {
      title: '页面不存在',
    },
  },
]
