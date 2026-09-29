import { defineStore } from 'pinia'
import type { KnowledgeDoc } from '@/types/content'

export interface ReadingHistoryItem {
  id: string
  title: string
  readAt: number
}

interface ReadingState {
  history: ReadingHistoryItem[]
  starredIds: string[]
  // 文档阅读进度（百分比 0-100），供"上次读到 xx%"断点续读；读完（≥95）自动清除
  progressMap: Record<string, number>
}

const HISTORY_LIMIT = 20

export const useReadingStore = defineStore('reading', {
  state: (): ReadingState => ({
    history: [],
    starredIds: [],
    progressMap: {},
  }),
  getters: {
    starredSet(state) {
      return new Set(state.starredIds)
    },
  },
  actions: {
    recordRead(doc: Pick<KnowledgeDoc, 'id' | 'title'>) {
      this.history = [
        { id: doc.id, title: doc.title, readAt: Date.now() },
        ...this.history.filter((item) => item.id !== doc.id),
      ].slice(0, HISTORY_LIMIT)
    },
    isStarred(docId: string) {
      return this.starredSet.has(docId)
    },
    toggleStar(doc: Pick<KnowledgeDoc, 'id' | 'title'>) {
      if (this.starredIds.includes(doc.id)) {
        this.starredIds = this.starredIds.filter((id) => id !== doc.id)
        return false
      }

      this.starredIds = [doc.id, ...this.starredIds]
      return true
    },
    saveProgress(docId: string, percent: number) {
      if (percent >= 95) {
        // 读到结尾即视为读完，清除断点
        delete this.progressMap[docId]
        return
      }

      if (percent >= 5) {
        this.progressMap[docId] = Math.round(percent)
      }
    },
    removeHistory(docId: string) {
      this.history = this.history.filter((item) => item.id !== docId)
    },
    clearHistory() {
      this.history = []
    },
    clearProgress(docId: string) {
      delete this.progressMap[docId]
    },
  },
  persist: {
    key: 'velpro_blog_reading',
    pick: ['history', 'starredIds', 'progressMap'],
  },
})
