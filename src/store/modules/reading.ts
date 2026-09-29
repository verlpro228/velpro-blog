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
}

const HISTORY_LIMIT = 20

export const useReadingStore = defineStore('reading', {
  state: (): ReadingState => ({
    history: [],
    starredIds: [],
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
  },
  persist: {
    key: 'velpro_blog_reading',
    pick: ['history', 'starredIds'],
  },
})
