import http from '@/api/http'
import type { ApiResponse } from '@/types/api'
import type { DashboardStats } from '@/types/stats'

export async function getDashboardStatsApi() {
  const response = await http.get<ApiResponse<DashboardStats>>('/stats')
  return response.data.data
}
