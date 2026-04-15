import { defineStore } from 'pinia'
import { STORAGE_KEYS } from '@/constants/app'
import { cloneDocsSeed } from '@/data/docs'
import type { DocMutationPayload, KnowledgeDoc } from '@/types/content'

interface DocsState {
  docs: KnowledgeDoc[]
  activeDocId: string
  keyword: string
  initialized: boolean
  loading: boolean
  saving: boolean
  lastFetchedAt: string
}

const sortDocs = (docs: KnowledgeDoc[]) =>
  [...docs].sort((left, right) => right.createTime.localeCompare(left.createTime))

const createDocId = () => `doc-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
const createDate = () => new Date().toISOString().slice(0, 10)

export const useDocsStore = defineStore('docs', {
  state: (): DocsState => ({
    docs: sortDocs(cloneDocsSeed()),
    activeDocId: '',
    keyword: '',
    initialized: true,
    loading: false,
    saving: false,
    lastFetchedAt: '',
  }),
  getters: {
    currentDoc(state) {
      return state.docs.find((doc) => doc.id === state.activeDocId) ?? null
    },
  },
  actions: {
    recordSyncTime() {
      this.lastFetchedAt = new Date().toISOString()
    },
    setKeyword(keyword: string) {
      this.keyword = keyword
    },
    setActiveDoc(docId: string) {
      this.activeDocId = docId
    },
    ensureActiveDoc() {
      if (!this.docs.length) {
        this.activeDocId = ''
        return
      }

      if (!this.docs.some((doc) => doc.id === this.activeDocId)) {
        this.activeDocId = this.docs[0].id
      }
    },
    upsertDoc(doc: KnowledgeDoc) {
      const index = this.docs.findIndex((item) => item.id === doc.id)

      if (index === -1) {
        this.docs = sortDocs([doc, ...this.docs])
      } else {
        const nextDocs = [...this.docs]
        nextDocs.splice(index, 1, doc)
        this.docs = sortDocs(nextDocs)
      }

      this.activeDocId = doc.id
    },
    async fetchDocs() {
      this.loading = true

      try {
        if (!this.docs.length && !this.initialized) {
          this.docs = sortDocs(cloneDocsSeed())
          this.initialized = true
        }

        this.ensureActiveDoc()

        if (!this.lastFetchedAt) {
          this.recordSyncTime()
        }
      } finally {
        this.loading = false
      }
    },
    async refreshDocs() {
      this.loading = true

      try {
        this.docs = sortDocs([...this.docs])
        this.ensureActiveDoc()
        this.recordSyncTime()
      } finally {
        this.loading = false
      }
    },
    async resetDocs() {
      this.loading = true

      try {
        this.docs = sortDocs(cloneDocsSeed())
        this.keyword = ''
        this.initialized = true
        this.ensureActiveDoc()
        this.recordSyncTime()
      } finally {
        this.loading = false
      }
    },
    async saveDoc(payload: DocMutationPayload & { id?: string }) {
      this.saving = true

      try {
        const current = payload.id ? this.docs.find((item) => item.id === payload.id) : null
        const doc: KnowledgeDoc = {
          id: payload.id ?? createDocId(),
          title: payload.title,
          summary: payload.summary,
          content: payload.content,
          tags: [...payload.tags],
          createTime: current?.createTime ?? createDate(),
        }

        this.upsertDoc(doc)
        this.recordSyncTime()
        return doc
      } finally {
        this.saving = false
      }
    },
    async deleteDoc(docId: string) {
      this.saving = true

      try {
        this.docs = this.docs.filter((doc) => doc.id !== docId)

        if (this.activeDocId === docId) {
          this.ensureActiveDoc()
        }

        this.recordSyncTime()
      } finally {
        this.saving = false
      }
    },
  },
  persist: {
    key: STORAGE_KEYS.docs,
    pick: ['docs', 'activeDocId', 'keyword', 'initialized', 'lastFetchedAt'],
  },
})
