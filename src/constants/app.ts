export const APP_NAME = 'Velpro Blog'

export const STORAGE_KEYS = {
  user: 'velpro_blog_user',
  docs: 'velpro_blog_docs',
  editorDraft: 'velpro_blog_editor_draft',
  theme: 'velpro_blog_theme',
} as const

export const NAVIGATION_ITEMS = [
  { label: '首页', path: '/' },
  { label: '知识库', path: '/knowledge' },
  { label: '项目展示', path: '/projects' },
  { label: '个人介绍', path: '/about' },
] as const

export const ADMIN_NAVIGATION_ITEMS = [
  { label: '文档管理', path: '/admin/editor' },
] as const
