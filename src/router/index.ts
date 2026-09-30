import { createRouter, createWebHistory } from 'vue-router'
import { APP_NAME, SITE_DESCRIPTION } from '@/constants/app'
import { useUserStore } from '@/store/modules/user'
import { setMeta } from '@/utils/meta'
import { routes } from './routes'

// 兼容旧版 Hash 路由链接（如 /#/knowledge → /knowledge），避免历史分享与收藏的链接失效。
// 必须在 createRouter 之前执行，让 router 初始化时就读到正确的 path。
if (typeof window !== 'undefined' && window.location.hash.startsWith('#/')) {
  window.history.replaceState(null, '', window.location.hash.slice(1))
}

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from) {
    // 知识库内切换文章由页面自身的 reset() 定位到正文顶部，这里不重复滚动，避免两者打架
    if (to.name === 'knowledge' && from.name === 'knowledge') {
      return false
    }

    return { top: 0, behavior: 'smooth' }
  },
})

router.beforeEach((to) => {
  const userStore = useUserStore()
  const pageTitle = to.meta.title ? `${to.meta.title} | ${APP_NAME}` : APP_NAME

  document.title = pageTitle

  setMeta('description', (to.meta.description as string | undefined) ?? SITE_DESCRIPTION)
  // 后台与登录页不进索引（robots.txt 为主，这里是二次保险）
  setMeta('robots', to.meta.noindex ? 'noindex,nofollow' : 'index,follow')

  if (to.meta.requiresAuth && !userStore.isAuthenticated) {
    return {
      path: '/login',
      query: {
        redirect: to.fullPath,
      },
    }
  }

  if (to.path === '/login' && userStore.isAuthenticated) {
    return '/admin/dashboard'
  }

  return true
})

export default router
