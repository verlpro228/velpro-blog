import axios from 'axios'
import type { ApiResponse } from '@/types/api'
import { useUserStore } from '@/store/modules/user'
import { showToast } from '@/utils/toast'

const http = axios.create({
  baseURL: '/api',
  timeout: 10000,
})

http.interceptors.request.use(
  (config) => {
    const userStore = useUserStore()

    if (userStore.token) {
      config.headers.Authorization = `Bearer ${userStore.token}`
    }

    return config
  },
  (error) => Promise.reject(error),
)

http.interceptors.response.use(
  (response) => {
    const responseData = response.data as ApiResponse<unknown>

    if (responseData.code !== 0) {
      showToast(responseData.message || '请求异常', { type: 'error' })
      return Promise.reject(new Error(responseData.message || '请求异常'))
    }

    return response
  },
  (error) => {
    const userStore = useUserStore()
    const status = error.response?.status

    if (status === 401) {
      userStore.clearSession()
      window.location.hash = '#/login'
    }

    showToast(error.response?.data?.message || error.message || '网络开小差了', { type: 'error' })
    return Promise.reject(error)
  },
)

export default http
