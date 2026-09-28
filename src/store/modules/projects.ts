import { defineStore } from 'pinia'
import {
  createProjectApi,
  deleteProjectApi,
  getAllProjectsApi,
  getProjectsApi,
  updateProjectApi,
  updateProjectVisibilityApi,
} from '@/api/modules/projects'
import type { ProjectCard, ProjectMutationPayload } from '@/types/content'

interface ProjectsState {
  /** 前台展示用：仅包含开启展示的项目 */
  projects: ProjectCard[]
  /** 后台管理用：包含全部项目（含已隐藏） */
  adminProjects: ProjectCard[]
  loading: boolean
  adminLoading: boolean
  saving: boolean
  initialized: boolean
  adminInitialized: boolean
  lastFetchedAt: number
  adminLastFetchedAt: number
}

// 页面切换频繁命中缓存，避免每次进页面都等远程数据库返回
const CACHE_TTL = 60_000

const sortProjects = (projects: ProjectCard[]) =>
  [...projects].sort((left, right) => left.sortOrder - right.sortOrder)

export const useProjectsStore = defineStore('projects', {
  state: (): ProjectsState => ({
    projects: [],
    adminProjects: [],
    loading: false,
    adminLoading: false,
    saving: false,
    initialized: false,
    adminInitialized: false,
    lastFetchedAt: 0,
    adminLastFetchedAt: 0,
  }),
  actions: {
    /** 数据发生变更后作废前台缓存，保证前台页面拿到最新列表 */
    invalidatePublicProjects() {
      this.initialized = false
      this.lastFetchedAt = 0
    },
    async fetchProjects(options?: { force?: boolean }) {
      const cacheFresh = this.initialized && Date.now() - this.lastFetchedAt < CACHE_TTL
      if (cacheFresh && !options?.force) {
        return
      }

      this.loading = true

      try {
        this.projects = sortProjects(await getProjectsApi())
        this.initialized = true
        this.lastFetchedAt = Date.now()
      } catch {
        // http 拦截器已提示错误，保留本地缓存数据
      } finally {
        this.loading = false
      }
    },
    async fetchAdminProjects(options?: { force?: boolean }) {
      const cacheFresh = this.adminInitialized && Date.now() - this.adminLastFetchedAt < CACHE_TTL
      if (cacheFresh && !options?.force) {
        return
      }

      this.adminLoading = true

      try {
        this.adminProjects = sortProjects(await getAllProjectsApi())
        this.adminInitialized = true
        this.adminLastFetchedAt = Date.now()
      } catch {
        // http 拦截器已提示错误，保留本地缓存数据
      } finally {
        this.adminLoading = false
      }
    },
    async saveProject(payload: ProjectMutationPayload & { id?: string }) {
      this.saving = true

      try {
        const project = payload.id
          ? await updateProjectApi(payload.id, payload)
          : await createProjectApi(payload)

        if (this.adminInitialized) {
          const index = this.adminProjects.findIndex((item) => item.id === project.id)
          if (index === -1) {
            this.adminProjects = sortProjects([...this.adminProjects, project])
          } else {
            const next = [...this.adminProjects]
            next.splice(index, 1, project)
            this.adminProjects = sortProjects(next)
          }
        }

        this.invalidatePublicProjects()
        return project
      } finally {
        this.saving = false
      }
    },
    async toggleProjectVisibility(projectId: string, visible: boolean) {
      const project = await updateProjectVisibilityApi(projectId, visible)

      const index = this.adminProjects.findIndex((item) => item.id === projectId)
      if (index !== -1) {
        const next = [...this.adminProjects]
        next.splice(index, 1, project)
        this.adminProjects = sortProjects(next)
      }

      this.invalidatePublicProjects()
      return project
    },
    async deleteProject(projectId: string) {
      this.saving = true

      try {
        await deleteProjectApi(projectId)
        this.adminProjects = this.adminProjects.filter((project) => project.id !== projectId)
        this.invalidatePublicProjects()
      } finally {
        this.saving = false
      }
    },
  },
})
