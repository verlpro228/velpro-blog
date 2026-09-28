import { defineStore } from 'pinia'
import { createDocApi, deleteDocApi, getDocApi, getDocsApi, updateDocApi } from '@/api/modules/docs'
import { STORAGE_KEYS } from '@/constants/app'
import type { DocMutationPayload, KnowledgeDoc } from '@/types/content'

interface DocsState {
  docs: KnowledgeDoc[]
  // docId -> 全文，按需从单篇接口加载；列表接口不含 content，避免每次拉取 70KB+ 数据
  contentCache: Record<string, string>
  activeDocId: string
  keyword: string
  initialized: boolean
  loading: boolean
  saving: boolean
  lastFetchedAt: string
}

const sortDocs = (docs: KnowledgeDoc[]) =>
  [...docs].sort((left, right) => right.createTime.localeCompare(left.createTime))

export const useDocsStore = defineStore('docs', {
  state: (): DocsState => ({
    docs: [],
    contentCache: {},
    activeDocId: '',
    keyword: '',
    initialized: false,
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

      if (docId) {
        void this.loadDocContent(docId)
      }
    },
    ensureActiveDoc() {
      if (!this.docs.length) {
        this.activeDocId = ''
        return
      }

      if (!this.docs.some((doc) => doc.id === this.activeDocId)) {
        this.activeDocId = this.docs[0].id
      }

      if (this.activeDocId) {
        void this.loadDocContent(this.activeDocId)
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

      this.contentCache[doc.id] = doc.content
      this.activeDocId = doc.id
    },
    async fetchDocs() {
      this.loading = true

      try {
        const docs = await getDocsApi()
        // 已加载过的全文写回列表，切换页面不重复请求
        this.docs = sortDocs(
          docs.map((doc) => ({
            ...doc,
            content: this.contentCache[doc.id] ?? doc.content,
          })),
        )
        this.initialized = true
        this.recordSyncTime()
      } catch {
        // http 拦截器已提示错误，保留本地缓存数据
      } finally {
        this.ensureActiveDoc()
        this.loading = false
      }
    },
    async loadDocContent(docId: string) {
      if (docId in this.contentCache) {
        return this.contentCache[docId]
      }

      try {
        const doc = await getDocApi(docId)
        this.contentCache[docId] = doc.content

        // 直接写回列表项（保持对象引用），依赖 currentDoc.content 的页面自动更新
        const item = this.docs.find((entry) => entry.id === docId)
        if (item) {
          item.content = doc.content
        }

        return doc.content
      } catch {
        // http 拦截器已提示错误
        return ''
      }
    },
    async refreshDocs() {
      await this.fetchDocs()
    },
    async resetDocs() {
      this.keyword = ''
      await this.fetchDocs()
    },
    async saveDoc(payload: DocMutationPayload & { id?: string }) {
      this.saving = true

      try {
        const doc = payload.id
          ? await updateDocApi(payload.id, payload)
          : await createDocApi(payload)

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
        await deleteDocApi(docId)
        this.docs = this.docs.filter((doc) => doc.id !== docId)
        delete this.contentCache[docId]

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
