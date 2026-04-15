import { createRouter, createWebHashHistory } from 'vue-router'
import { APP_NAME } from '@/constants/app'
import { useUserStore } from '@/store/modules/user'
import { routes } from './routes'

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior() {
    return { top: 0, behavior: 'smooth' }
  },
})

router.beforeEach((to) => {
  const userStore = useUserStore()
  const pageTitle = to.meta.title ? `${to.meta.title} | ${APP_NAME}` : APP_NAME

  document.title = pageTitle

  if (to.meta.requiresAuth && !userStore.isAuthenticated) {
    return {
      path: '/login',
      query: {
        redirect: to.fullPath,
      },
    }
  }

  if (to.path === '/login' && userStore.isAuthenticated) {
    return '/admin/editor'
  }

  return true
})

export default router
