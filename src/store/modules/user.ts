import { defineStore } from 'pinia'
import { STORAGE_KEYS } from '@/constants/app'
import type { LoginResponse, UserProfile } from '@/types/user'

interface UserState {
  token: string
  profile: UserProfile | null
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    token: '',
    profile: null,
  }),
  getters: {
    isAuthenticated: (state) => Boolean(state.token),
  },
  actions: {
    setToken(token: string) {
      this.token = token
    },
    setProfile(profile: UserProfile | null) {
      this.profile = profile
    },
    setUserSession(payload: LoginResponse) {
      this.token = payload.token
      this.profile = payload.userInfo
    },
    clearSession() {
      this.token = ''
      this.profile = null
    },
  },
  persist: {
    key: STORAGE_KEYS.user,
    pick: ['token', 'profile'],
  },
})
