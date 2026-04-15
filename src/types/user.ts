export interface UserProfile {
  id: string
  name: string
  role: 'admin' | 'visitor'
  avatar: string
  tagline: string
}

export interface LoginPayload {
  username: string
  password: string
}

export interface LoginResponse {
  token: string
  userInfo: UserProfile
}
