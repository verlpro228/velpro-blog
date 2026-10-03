import http from '@/api/http'
import type { ApiResponse } from '@/types/api'
import type { DashboardStats, PublicStats } from '@/types/stats'

export async function getDashboardStatsApi() {
  const response = await http.get<ApiResponse<DashboardStats>>('/stats')
  return response.data.data
}

/** 前台统计页：免鉴权公开口径（时间戳参数防浏览器缓存，保证统计实时） */
export async function getPublicStatsApi() {
  const response = await http.get<ApiResponse<PublicStats>>('/stats/public', {
    params: { t: Date.now() },
  })
  return response.data.data
}
