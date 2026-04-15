import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { STATIC_ADMIN_PROFILE, STATIC_LOGIN_CREDENTIALS } from '@/data/auth'
import type { LoginPayload } from '@/types/user'
import { useUserStore } from '@/store/modules/user'

const wait = (duration = 260) => new Promise((resolve) => window.setTimeout(resolve, duration))

export function useAuth() {
  const userStore = useUserStore()
  const loading = ref(false)
  const router = useRouter()

  const login = async (payload: LoginPayload) => {
    loading.value = true

    try {
      await wait()

      const username = payload.username.trim()
      const password = payload.password

      if (
        username !== STATIC_LOGIN_CREDENTIALS.username ||
        password !== STATIC_LOGIN_CREDENTIALS.password
      ) {
        throw new Error('INVALID_CREDENTIALS')
      }

      const response = {
        ...STATIC_ADMIN_PROFILE,
        userInfo: {
          ...STATIC_ADMIN_PROFILE.userInfo,
        },
      }

      userStore.setUserSession(response)
      return response
    } finally {
      loading.value = false
    }
  }

  const logout = async () => {
    userStore.clearSession()
    await router.push('/login')
  }

  return {
    loading,
    login,
    logout,
    isAuthenticated: computed(() => userStore.isAuthenticated),
  }
}
