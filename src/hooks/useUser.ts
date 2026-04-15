import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/store/modules/user'

export function useUser() {
  const userStore = useUserStore()
  const { token, profile } = storeToRefs(userStore)

  return {
    userStore,
    token,
    profile,
    isAuthenticated: computed(() => userStore.isAuthenticated),
  }
}
