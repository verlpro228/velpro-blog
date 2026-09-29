import type { RouteRecordRaw } from 'vue-router'

export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('@/layout/BaseLayout.vue'),
    meta: {
      title: '首页',
      layout: 'default',
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
        path: 'knowledge',
        name: 'knowledge',
        component: () => import('@/views/KnowledgeView.vue'),
        meta: {
          title: '知识库',
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
      layout: 'blank',
    },
  },
  {
    path: '/admin',
    component: () => import('@/layout/AdminLayout.vue'),
    meta: {
      title: '后台管理',
      requiresAuth: true,
      layout: 'admin',
    },
    children: [
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
      layout: 'blank',
    },
  },
]
