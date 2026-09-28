import http from '@/api/http'
import type { ApiResponse } from '@/types/api'
import type {
  LoginPayload,
  LoginResponse,
  PasswordUpdatePayload,
  ProfileUpdatePayload,
  UserProfile,
} from '@/types/user'

export async function loginApi(payload: LoginPayload) {
  const response = await http.post<ApiResponse<LoginResponse>>('/auth/login', payload)
  return response.data.data
}

export async function getProfileApi() {
  const response = await http.get<ApiResponse<UserProfile>>('/auth/profile')
  return response.data.data
}

export async function updateProfileApi(payload: ProfileUpdatePayload) {
  const response = await http.put<ApiResponse<UserProfile>>('/auth/profile', payload)
  return response.data.data
}

export async function updatePasswordApi(payload: PasswordUpdatePayload) {
  const response = await http.put<ApiResponse<{ success: boolean }>>('/auth/password', payload)
  return response.data.data
}
