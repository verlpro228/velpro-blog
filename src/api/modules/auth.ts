import http from '@/api/http'
import type { ApiResponse } from '@/types/api'
import type { LoginPayload, LoginResponse } from '@/types/user'

export async function loginApi(payload: LoginPayload) {
  const response = await http.post<ApiResponse<LoginResponse>>('/auth/login', payload)
  return response.data.data
}
