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

export interface ProjectMetric {
  label: string
  value: string
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
  responsibilities: string[]
  metrics: ProjectMetric[]
  sortOrder: number
  visible: boolean
}

// visible 由列表开关单独控制，不随编辑弹窗一起提交
export type ProjectMutationPayload = Omit<ProjectCard, 'id' | 'visible'>

export interface ContactItem {
  label: string
  value: string
  href: string
}

export interface SkillGroup {
  title: string
  items: string[]
}

export interface ExperienceItem {
  company: string
  position: string
  period: string
  content: string
}

export interface EducationItem {
  school: string
  major: string
  period: string
  honors: string
}

export interface SiteProfile {
  name: string
  target: string
  summary: string
  contacts: ContactItem[]
  skillGroups: SkillGroup[]
  skillDetails: string
  experiences: ExperienceItem[]
  education: EducationItem[]
  timeline: TimelineItem[]
}

export interface TimelineItem {
  id: string
  title: string
  period: string
  description: string
}
