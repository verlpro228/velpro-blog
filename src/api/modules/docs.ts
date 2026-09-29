import http from '@/api/http'
import type { ApiResponse } from '@/types/api'
import type { DocMutationPayload, KnowledgeDoc } from '@/types/content'

export async function getDocsApi() {
  const response = await http.get<ApiResponse<KnowledgeDoc[]>>('/docs')
  return response.data.data
}

// 后台专用：返回全部文档（含草稿），公开列表只返回已发布
export async function getManageDocsApi() {
  const response = await http.get<ApiResponse<KnowledgeDoc[]>>('/docs/manage')
  return response.data.data
}

export async function getDocApi(id: string) {
  const response = await http.get<ApiResponse<KnowledgeDoc>>(`/docs/${id}`)
  return response.data.data
}

export async function createDocApi(payload: DocMutationPayload) {
  const response = await http.post<ApiResponse<KnowledgeDoc>>('/docs', payload)
  return response.data.data
}

export async function updateDocApi(id: string, payload: DocMutationPayload) {
  const response = await http.put<ApiResponse<KnowledgeDoc>>(`/docs/${id}`, payload)
  return response.data.data
}

export async function deleteDocApi(id: string) {
  const response = await http.delete<ApiResponse<{ success: boolean }>>(`/docs/${id}`)
  return response.data.data
}

export async function reportDocViewApi(id: string) {
  const response = await http.post<ApiResponse<{ views: number }>>(`/docs/${id}/view`)
  return response.data.data.views
}

export async function likeDocApi(id: string) {
  const response = await http.post<ApiResponse<{ likes: number }>>(`/docs/${id}/like`)
  return response.data.data.likes
}
