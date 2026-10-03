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

/** 前台公开统计：口径不含草稿数（内部信息） */
export interface PublicStats {
  overview: Omit<DashboardOverview, 'draftCount'>
  topDocs: TopDocItem[]
  tagStats: TagStatItem[]
  monthly: MonthlyPublishItem[]
}
