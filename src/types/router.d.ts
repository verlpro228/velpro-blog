import 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    title: string
    requiresAuth?: boolean
    layout?: 'default' | 'admin' | 'blank'
  }
}
