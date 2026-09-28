import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { loginApi } from '@/api/modules/auth'
import type { LoginPayload } from '@/types/user'
import { useUserStore } from '@/store/modules/user'

export function useAuth() {
  const userStore = useUserStore()
  const loading = ref(false)
  const router = useRouter()

  const login = async (payload: LoginPayload) => {
    loading.value = true

    try {
      const response = await loginApi({
        username: payload.username.trim(),
        password: payload.password,
      })

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
