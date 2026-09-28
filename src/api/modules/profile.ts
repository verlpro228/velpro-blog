import http from '@/api/http'
import type { ApiResponse } from '@/types/api'
import type { SiteProfile } from '@/types/content'

export async function getSiteProfileApi() {
  const response = await http.get<ApiResponse<SiteProfile | null>>('/profile')
  return response.data.data
}

export async function updateSiteProfileApi(payload: SiteProfile) {
  const response = await http.put<ApiResponse<SiteProfile>>('/profile', payload)
  return response.data.data
}
