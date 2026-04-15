import http from '@/api/http'
import type { ApiResponse } from '@/types/api'
import type { DocMutationPayload, KnowledgeDoc } from '@/types/content'

export async function getDocsApi() {
  const response = await http.get<ApiResponse<KnowledgeDoc[]>>('/docs')
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
