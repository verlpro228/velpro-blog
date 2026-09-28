import { defineStore } from 'pinia'
import { getSiteProfileApi, updateSiteProfileApi } from '@/api/modules/profile'
import type { SiteProfile } from '@/types/content'

interface SiteProfileState {
  profile: SiteProfile | null
  loading: boolean
  saving: boolean
  initialized: boolean
  lastFetchedAt: number
}

const CACHE_TTL = 60_000

export const useSiteProfileStore = defineStore('siteProfile', {
  state: (): SiteProfileState => ({
    profile: null,
    loading: false,
    saving: false,
    initialized: false,
    lastFetchedAt: 0,
  }),
  actions: {
    async fetchProfile(options?: { force?: boolean }) {
      const cacheFresh = this.initialized && Date.now() - this.lastFetchedAt < CACHE_TTL
      if (cacheFresh && !options?.force) {
        return
      }

      this.loading = true

      try {
        this.profile = await getSiteProfileApi()
        this.initialized = true
        this.lastFetchedAt = Date.now()
      } catch {
        // http 拦截器已提示错误，保留本地缓存数据
      } finally {
        this.loading = false
      }
    },
    async saveProfile(payload: SiteProfile) {
      this.saving = true

      try {
        const saved = await updateSiteProfileApi(payload)
        this.profile = saved
        this.initialized = true
        this.lastFetchedAt = Date.now()
        return saved
      } finally {
        this.saving = false
      }
    },
  },
})
