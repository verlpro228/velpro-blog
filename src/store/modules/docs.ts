import { defineStore } from 'pinia'
import {
  createDocApi,
  deleteDocApi,
  getDocApi,
  getDocsApi,
  getManageDocsApi,
  likeDocApi,
  reportDocViewApi,
  updateDocApi,
} from '@/api/modules/docs'
import { DOC_INTERACTION_KEYS, STORAGE_KEYS } from '@/constants/app'
import { getLocalStorage, setLocalStorage } from '@/utils/storage'
import type { DocMutationPayload, KnowledgeDoc } from '@/types/content'

interface DocsState {
  docs: KnowledgeDoc[]
  // docId -> 全文，按需从单篇接口加载；列表接口不含 content，避免每次拉取 70KB+ 数据
  contentCache: Record<string, string>
  activeDocId: string
  keyword: string
  initialized: boolean
  loading: boolean
  // 列表拉取失败且本地无数据时为 true，侧栏展示"重新加载"入口
  loadError: boolean
  saving: boolean
  lastFetchedAt: string
  // 已点赞文档（localStorage 持久化，与 store 分开存）
  likedDocIds: string[]
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
    loadError: false,
    saving: false,
    lastFetchedAt: '',
    likedDocIds: getLocalStorage<string[]>(DOC_INTERACTION_KEYS.likedDocs, []),
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
    async fetchDocs(options: { includeDrafts?: boolean } = {}) {
      this.loading = true

      try {
        // 后台编辑器拉全量（含草稿），公开页只拉已发布；两个页面挂载时都会重新拉取，列表互不残留
        const docs = options.includeDrafts ? await getManageDocsApi() : await getDocsApi()
        // 已加载过的全文写回列表，切换页面不重复请求
        this.docs = sortDocs(
          docs.map((doc) => ({
            ...doc,
            content: this.contentCache[doc.id] ?? doc.content,
          })),
        )
        this.initialized = true
        this.loadError = false
        this.recordSyncTime()
      } catch {
        // http 拦截器已提示错误，保留本地缓存数据并标记失败状态
        if (!this.docs.length) {
          this.loadError = true
        }
      } finally {
        this.ensureActiveDoc()
        this.loading = false
      }
    },

    async warmContentCache() {
      // 空闲时渐进拉取全部全文，供全文检索使用；已缓存的跳过
      const pending = this.docs.filter((doc) => !(doc.id in this.contentCache))

      for (const doc of pending) {
        if (!(doc.id in this.contentCache)) {
          await this.loadDocContent(doc.id)
        }
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

    isDocLiked(docId: string) {
      return this.likedDocIds.includes(docId)
    },

    async likeDoc(docId: string, liked = true) {
      // 幂等：已赞再赞 / 未赞再取消都不重复请求
      if (this.isDocLiked(docId) === liked) {
        return this.docs.find((doc) => doc.id === docId)?.likes ?? 0
      }

      // 乐观更新：先改本地状态让 UI 即时反馈（远程库往返 1s+，不能等响应再渲染），失败再回滚
      const item = this.docs.find((doc) => doc.id === docId)
      const previousLiked = !liked
      const previousLikes = item?.likes ?? 0
      this.likedDocIds = liked
        ? [...this.likedDocIds, docId]
        : this.likedDocIds.filter((id) => id !== docId)
      setLocalStorage(DOC_INTERACTION_KEYS.likedDocs, this.likedDocIds)
      if (item) {
        item.likes = Math.max(0, previousLikes + (liked ? 1 : -1))
      }

      try {
        const likes = await likeDocApi(docId, liked)
        // 请求期间用户可能已再次点击（状态反转）：只校准仍与本请求意图一致的计数，避免覆盖最新状态
        if (this.isDocLiked(docId) === liked && item) {
          item.likes = likes
        }
        return likes
      } catch (error) {
        // 回滚：仅当期间状态未被再次操作时，避免吞掉用户的后续点击
        if (this.isDocLiked(docId) === liked) {
          this.likedDocIds = previousLiked
            ? [...this.likedDocIds, docId]
            : this.likedDocIds.filter((id) => id !== docId)
          setLocalStorage(DOC_INTERACTION_KEYS.likedDocs, this.likedDocIds)
          if (item) {
            item.likes = previousLikes
          }
        }
        throw error
      }
    },

    async reportView(docId: string) {
      // 每个浏览器会话每篇只计一次
      try {
        const raw = sessionStorage.getItem(DOC_INTERACTION_KEYS.viewedDocs)
        const viewed: string[] = raw ? JSON.parse(raw) : []

        if (viewed.includes(docId)) {
          return
        }

        viewed.push(docId)
        sessionStorage.setItem(DOC_INTERACTION_KEYS.viewedDocs, JSON.stringify(viewed))
      } catch {
        // sessionStorage 不可用时直接上报，不影响阅读
      }

      try {
        const views = await reportDocViewApi(docId)
        const item = this.docs.find((doc) => doc.id === docId)

        if (item) {
          item.views = views
        }
      } catch {
        // 上报失败静默：拦截器已提示，下次会话会重新计入
      }
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
