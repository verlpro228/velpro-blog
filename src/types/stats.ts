export interface DashboardOverview {
  docCount: number
  draftCount: number
  projectCount: number
  totalViews: number
  totalLikes: number
}

export interface TopDocItem {
  id: string
  title: string
  views: number
  likes: number
}

export interface TagStatItem {
  name: string
  count: number
}

export interface MonthlyPublishItem {
  month: string
  count: number
}

export interface DashboardStats {
  overview: DashboardOverview
  topDocs: TopDocItem[]
  tagStats: TagStatItem[]
  monthly: MonthlyPublishItem[]
}
