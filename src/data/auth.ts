import type { LoginResponse } from '@/types/user'

export const STATIC_LOGIN_CREDENTIALS = {
  username: 'velpro',
  password: 'velpro666',
} as const

export const STATIC_ADMIN_PROFILE: LoginResponse = {
  token: 'static-admin-token',
  userInfo: {
    id: 'u_001',
    name: 'Velpro',
    role: 'admin',
    avatar: 'https://api.dicebear.com/9.x/glass/svg?seed=Velpro',
    tagline: 'Frontend Engineer',
  },
}
