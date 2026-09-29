export const APP_NAME = 'Velpro Blog'

export const SITE_DESCRIPTION =
  'Velpro Blog：基于 Vue 3 + FastAPI 的个人技术知识博客，涵盖前端知识库、项目作品展示与 AI 流式答疑，支持 Markdown 在线管理与多格式导出。'

export const STORAGE_KEYS = {
  user: 'velpro_blog_user',
  docs: 'velpro_blog_docs',
  editorDraft: 'velpro_blog_editor_draft',
  theme: 'velpro_blog_theme',
} as const

// 文档互动去重：点赞全局只记一次（localStorage），浏览量每个浏览器会话只记一次（sessionStorage）
export const DOC_INTERACTION_KEYS = {
  likedDocs: 'velpro_blog_liked_docs',
  viewedDocs: 'velpro_blog_viewed_docs',
} as const

// giscus 评论配置：在 https://giscus.app/zh-CN 用仓库生成后填入 repoId / categoryId，留空则前台不渲染评论区
export const GISCUS_CONFIG = {
  repo: 'verlpro228/velpro-blog',
  repoId: 'R_kgDOSDKZAw',
  category: 'Announcements',
  categoryId: 'DIC_kwDOSDKZA84DGp5l',
  // 每篇文档一个独立讨论串，键为 termPrefix + 文档 id
  termPrefix: 'doc:',
} as const

export const NAVIGATION_ITEMS = [
  { label: '首页', path: '/' },
  { label: '知识库', path: '/knowledge' },
  { label: '归档', path: '/archive' },
  { label: '项目展示', path: '/projects' },
  { label: '个人介绍', path: '/about' },
  { label: '留言板', path: '/guestbook' },
] as const

export const ADMIN_NAVIGATION_ITEMS = [
  { label: '数据看板', path: '/admin/dashboard' },
  { label: '文档管理', path: '/admin/editor' },
  { label: '项目管理', path: '/admin/projects' },
  { label: '介绍管理', path: '/admin/profile' },
  { label: '账号设置', path: '/admin/settings' },
] as const
