export interface KnowledgeDoc {
  id: string
  title: string
  summary: string
  content: string
  tags: string[]
  createTime: string
}

export interface DocMutationPayload {
  title: string
  summary: string
  content: string
  tags: string[]
}

export interface TocItem {
  id: string
  level: number
  text: string
}

export interface ProjectCard {
  id: string
  title: string
  summary: string
  cover: string
  techStacks: string[]
  category: string
  period: string
  role: string
  highlights: string[]
  features: string[]
  outcomes: string[]
  metrics: Array<{
    label: string
    value: string
  }>
}

export interface TimelineItem {
  id: string
  title: string
  period: string
  description: string
}
