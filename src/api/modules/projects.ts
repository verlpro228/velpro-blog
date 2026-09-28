import http from '@/api/http'
import type { ApiResponse } from '@/types/api'
import type { ProjectCard, ProjectMutationPayload } from '@/types/content'

export async function getProjectsApi() {
  const response = await http.get<ApiResponse<ProjectCard[]>>('/projects')
  return response.data.data
}

// 后台管理用：返回全部项目（含已隐藏），需登录
export async function getAllProjectsApi() {
  const response = await http.get<ApiResponse<ProjectCard[]>>('/projects/manage')
  return response.data.data
}

export async function updateProjectVisibilityApi(id: string, visible: boolean) {
  const response = await http.put<ApiResponse<ProjectCard>>(`/projects/${id}/visibility`, { visible })
  return response.data.data
}

export async function createProjectApi(payload: ProjectMutationPayload) {
  const response = await http.post<ApiResponse<ProjectCard>>('/projects', payload)
  return response.data.data
}

export async function updateProjectApi(id: string, payload: ProjectMutationPayload) {
  const response = await http.put<ApiResponse<ProjectCard>>(`/projects/${id}`, payload)
  return response.data.data
}

export async function deleteProjectApi(id: string) {
  const response = await http.delete<ApiResponse<{ success: boolean }>>(`/projects/${id}`)
  return response.data.data
}
