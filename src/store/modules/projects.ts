import { defineStore } from 'pinia'
import {
  createProjectApi,
  deleteProjectApi,
  getProjectsApi,
  updateProjectApi,
} from '@/api/modules/projects'
import type { ProjectCard, ProjectMutationPayload } from '@/types/content'

interface ProjectsState {
  projects: ProjectCard[]
  loading: boolean
  saving: boolean
  initialized: boolean
  lastFetchedAt: number
}

// 页面切换频繁命中缓存，避免每次进页面都等远程数据库返回
const CACHE_TTL = 60_000

const sortProjects = (projects: ProjectCard[]) =>
  [...projects].sort((left, right) => left.sortOrder - right.sortOrder)

export const useProjectsStore = defineStore('projects', {
  state: (): ProjectsState => ({
    projects: [],
    loading: false,
    saving: false,
    initialized: false,
    lastFetchedAt: 0,
  }),
  actions: {
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
    async saveProject(payload: ProjectMutationPayload & { id?: string }) {
      this.saving = true

      try {
        const project = payload.id
          ? await updateProjectApi(payload.id, payload)
          : await createProjectApi(payload)

        const index = this.projects.findIndex((item) => item.id === project.id)
        if (index === -1) {
          this.projects = sortProjects([...this.projects, project])
        } else {
          const next = [...this.projects]
          next.splice(index, 1, project)
          this.projects = sortProjects(next)
        }

        return project
      } finally {
        this.saving = false
      }
    },
    async deleteProject(projectId: string) {
      this.saving = true

      try {
        await deleteProjectApi(projectId)
        this.projects = this.projects.filter((project) => project.id !== projectId)
      } finally {
        this.saving = false
      }
    },
  },
})
