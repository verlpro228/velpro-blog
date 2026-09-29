<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { onClickOutside } from '@vueuse/core'
import AppEmptyState from '@/components/common/AppEmptyState.vue'
import AppSkeletonLines from '@/components/common/AppSkeletonLines.vue'
import ProgressBar from '@/components/common/ProgressBar.vue'
import DocComments from '@/components/knowledge/DocComments.vue'
import DocFooterNav from '@/components/knowledge/DocFooterNav.vue'
import DocToc from '@/components/knowledge/DocToc.vue'
import KnowledgeArticleList from '@/components/knowledge/KnowledgeArticleList.vue'
import KnowledgeLightbox from '@/components/knowledge/KnowledgeLightbox.vue'
import { useAsyncMarkdown } from '@/hooks/useAsyncMarkdown'
import { useKnowledgeSearch } from '@/hooks/useKnowledgeSearch'
import { useReadingProgress } from '@/hooks/useReadingProgress'
import { useDocsStore } from '@/store/modules/docs'
import { showToast } from '@/utils/toast'
import { extractToc } from '@/utils/markdown'
import { estimateReadingMinutes } from '@/utils/readingTime'
import {
  exportDocAsJson,
  exportDocAsMarkdown,
  exportDocAsPdf,
  type DocExportFormat,
} from '@/utils/docExport'

const docsStore = useDocsStore()
const articleContainerRef = ref<HTMLElement | null>(null)

const exportWrapperRef = ref<HTMLElement | null>(null)
const isExportOpen = ref(false)

const exportOptions: Array<{ format: DocExportFormat; label: string; extension: string }> = [
  { format: 'markdown', label: 'Markdown 文档', extension: '.md' },
  { format: 'pdf', label: 'PDF 文档', extension: '.pdf' },
  { format: 'json', label: 'JSON 数据', extension: '.json' },
]

onClickOutside(exportWrapperRef, () => {
  isExportOpen.value = false
})

function toggleExportMenu() {
  isExportOpen.value = !isExportOpen.value
}

async function handleExport(format: DocExportFormat) {
  isExportOpen.value = false

  const doc = currentDoc.value

  if (!doc) {
    return
  }

  if (format === 'markdown') {
    exportDocAsMarkdown(doc)
    showToast(`已导出 Markdown：${doc.title}.md`, { type: 'success' })
    return
  }

  if (format === 'json') {
    exportDocAsJson(doc)
    showToast(`已导出 JSON：${doc.title}.json`, { type: 'success' })
    return
  }

  try {
    await exportDocAsPdf(doc, renderedContent.value)
    showToast(`已导出 PDF：${doc.title}.pdf`, { type: 'success' })
  }
  catch {
    showToast('PDF 导出失败，请重试', { type: 'error' })
  }
}

const visibleSource = computed(() => docsStore.docs)
const currentDoc = computed(() => docsStore.currentDoc)
const markdownSource = computed(() => currentDoc.value?.content ?? '')

const syncLabel = computed(() => {
  if (!docsStore.lastFetchedAt) {
    return '等待首次同步'
  }

  return new Date(docsStore.lastFetchedAt).toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
})

const { html: renderedContent, loading: renderingMarkdown } = useAsyncMarkdown(markdownSource, {
  codeCopy: true,
})

const { keyword, debouncedKeyword, results: visibleDocs, isSearching } = useKnowledgeSearch(
  visibleSource,
  docsStore.keyword,
  docsStore.setKeyword,
)

const { progress, activeHeadingId, syncHeadings, update, reset, scrollToHeading } =
  useReadingProgress(articleContainerRef, {
    mode: 'page',
    topOffset: 112,
  })

const resultText = computed(() => {
  if (!docsStore.docs.length) {
    return '当前还没有文档'
  }

  if (isSearching.value && debouncedKeyword.value) {
    return `关键词“${debouncedKeyword.value}”共匹配到 ${visibleDocs.value.length} 篇文档`
  }

  return `当前共 ${visibleDocs.value.length} 篇文档`
})

const readingMinutes = computed(() => estimateReadingMinutes(markdownSource.value))

const tocItems = computed(() => extractToc(renderedContent.value))
const isTocOpen = ref(false)

function handleTocJump(headingId: string) {
  isTocOpen.value = false
  scrollToHeading(headingId)
}

const currentDocIndex = computed(() =>
  docsStore.docs.findIndex((doc) => doc.id === currentDoc.value?.id),
)

// 上一篇 = 更早发布（列表按时间倒序，往后一位）
const prevDoc = computed(() =>
  currentDocIndex.value >= 0 ? docsStore.docs[currentDocIndex.value + 1] ?? null : null,
)

const nextDoc = computed(() =>
  currentDocIndex.value > 0 ? docsStore.docs[currentDocIndex.value - 1] ?? null : null,
)

const relatedDocs = computed(() => {
  const doc = currentDoc.value

  if (!doc) {
    return []
  }

  const tagSet = new Set(doc.tags)

  return docsStore.docs
    .filter((item) => item.id !== doc.id)
    .map((item) => ({ item, score: item.tags.filter((tag) => tagSet.has(tag)).length }))
    .filter((entry) => entry.score > 0)
    .sort((left, right) => right.score - left.score)
    .slice(0, 2)
    .map((entry) => entry.item)
})

const lightbox = ref({ open: false, src: '', alt: '' })

async function copyCodeBlock(button: HTMLElement) {
  const code = button.closest('.code-block')?.querySelector('pre code')?.textContent ?? ''

  if (!code) {
    return
  }

  try {
    await navigator.clipboard.writeText(code)
  } catch {
    // 非安全上下文（http）下剪贴板 API 不可用，降级 execCommand
    const textarea = document.createElement('textarea')
    textarea.value = code
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    textarea.remove()
  }

  button.classList.add('is-copied')
  button.textContent = '已复制'
  window.setTimeout(() => {
    button.classList.remove('is-copied')
    button.textContent = '复制'
  }, 1600)
}

function handleArticleClick(event: MouseEvent) {
  const target = event.target as HTMLElement

  const copyButton = target.closest<HTMLElement>('[data-code-copy]')
  if (copyButton) {
    void copyCodeBlock(copyButton)
    return
  }

  const image = target.closest('img')
  if (image?.src) {
    lightbox.value = { open: true, src: image.src, alt: image.alt }
  }
}

const isLiked = computed(() => (currentDoc.value ? docsStore.isDocLiked(currentDoc.value.id) : false))

async function handleLike() {
  const doc = currentDoc.value

  if (!doc || isLiked.value) {
    return
  }

  try {
    const likes = await docsStore.likeDoc(doc.id)
    showToast('感谢点赞！', { type: 'success' })
    void likes
  } catch {
    // 拦截器已提示
  }
}

const handleWindowScroll = () => {
  update()
}

const handleWindowResize = () => {
  void syncHeadings().then(() => update())
}

watch(
  () => visibleDocs.value.map((item) => item.id).join(','),
  (ids) => {
    if (!ids) {
      docsStore.setActiveDoc('')
      return
    }

    if (!visibleDocs.value.some((item) => item.id === docsStore.activeDocId)) {
      docsStore.setActiveDoc(visibleDocs.value[0].id)
    }
  },
  { immediate: true },
)

watch(
  () => currentDoc.value?.id,
  (docId) => {
    if (!docId) {
      return
    }

    isTocOpen.value = false

    // 浏览量字段由新接口返回；未部署后端前该字段为 undefined，不会发请求
    if (typeof currentDoc.value?.views === 'number') {
      void docsStore.reportView(docId)
    }

    void nextTick().then(async () => {
      reset({ behavior: 'auto' })
      update()
    })
  },
)

watch(renderedContent, async () => {
  await syncHeadings()
  update()
})

onMounted(() => {
  window.addEventListener('scroll', handleWindowScroll, { passive: true })
  window.addEventListener('resize', handleWindowResize)

  void docsStore.fetchDocs().then(async () => {
    await nextTick()
    await syncHeadings()
    update()

    // 延迟预热全文缓存（供正文检索），不占用首屏与当前阅读的加载
    window.setTimeout(() => {
      void docsStore.warmContentCache()
    }, 2000)
  })
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleWindowScroll)
  window.removeEventListener('resize', handleWindowResize)
})
</script>

<template>
  <div class="knowledge-page px-3 pb-16 sm:px-6 sm:pb-20">
    <ProgressBar :percentage="progress" />

    <div class="mx-auto max-w-screen-xl 2xl:max-w-screen-2xl">
      <section
        class="knowledge-hero mb-6 rounded-[1.75rem] border border-slate-200 bg-white px-4 py-6 shadow-sm sm:px-8 sm:py-8"
      >
        <div class="flex flex-wrap items-end justify-between gap-6">
          <div class="max-w-3xl">
            <p class="app-overline text-xs uppercase tracking-[0.32em]">知识库</p>
            <h1 class="knowledge-hero-title mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-[2.8rem]">
              构建你的前端知识图谱
            </h1>
            <p class="knowledge-hero-copy mt-4 text-sm leading-7 text-slate-600 sm:text-base sm:leading-8">
              精选核心文档，从基础原理到实战应用。每一次点击，都是一次更清晰的复盘与延展。
            </p>
          </div>

          <div class="knowledge-hero-meta w-full rounded-[1.5rem] border border-slate-200 bg-slate-50 px-5 py-4 text-sm shadow-sm sm:w-auto">
            <p class="knowledge-hero-meta-label text-slate-500">最近同步</p>
            <p class="knowledge-hero-meta-value mt-2 text-lg font-semibold text-slate-800">{{ syncLabel }}</p>
            <p class="knowledge-hero-meta-copy mt-1 max-w-56 truncate text-xs text-slate-500">
              {{ currentDoc?.title ?? '请选择一篇文档开始阅读' }}
            </p>
          </div>
        </div>
      </section>

      <section class="flex flex-col gap-6 xl:flex-row xl:items-start xl:gap-6">
        <div class="xl:sticky xl:top-24 xl:w-72 xl:flex-none xl:self-start">
          <KnowledgeArticleList
            :docs="visibleDocs"
            :active-doc-id="docsStore.activeDocId"
            :loading="docsStore.loading"
            :keyword="keyword"
            :result-text="resultText"
            :load-error="docsStore.loadError"
            @update:keyword="keyword = $event"
            @select="docsStore.setActiveDoc"
            @retry="docsStore.refreshDocs()"
          />
        </div>

        <div class="min-w-0 flex-1">
          <article
            ref="articleContainerRef"
            class="knowledge-content-card w-full max-w-5xl rounded-[1.75rem] border border-slate-200 bg-white px-4 py-6 shadow-sm sm:px-8 sm:py-10 lg:px-10"
          >
            <template v-if="currentDoc">
              <header class="knowledge-content-header mb-8 border-b border-slate-200 pb-6 sm:mb-10 sm:pb-8">
                <div class="flex flex-wrap items-center justify-between gap-3">
                  <div class="knowledge-content-meta flex flex-wrap items-center gap-3 text-sm text-slate-500">
                    <span>{{ currentDoc.createTime }}</span>
                    <span class="knowledge-content-separator text-slate-300">•</span>
                    <span>{{ currentDoc.tags.length }} 个标签</span>

                    <template v-if="readingMinutes">
                      <span class="knowledge-content-separator text-slate-300">•</span>
                      <span>约 {{ readingMinutes }} 分钟</span>
                    </template>

                    <template v-if="typeof currentDoc.views === 'number'">
                      <span class="knowledge-content-separator text-slate-300">•</span>
                      <span>{{ currentDoc.views }} 次阅读</span>
                    </template>

                    <button
                      v-if="typeof currentDoc.likes === 'number'"
                      type="button"
                      class="knowledge-like-btn inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium transition"
                      :class="{ 'is-liked': isLiked }"
                      :disabled="isLiked"
                      :title="isLiked ? '已点赞' : '点赞支持'"
                      @click="handleLike"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-3.5 w-3.5" aria-hidden="true">
                        <path d="M7 10v12" />
                        <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z" />
                      </svg>
                      <span>{{ currentDoc.likes }}</span>
                    </button>
                  </div>

                  <div ref="exportWrapperRef" class="relative">
                    <button
                      type="button"
                      class="knowledge-export-trigger inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-xs font-medium text-slate-600 transition hover:border-slate-300 hover:bg-white hover:text-slate-900"
                      :aria-expanded="isExportOpen"
                      aria-haspopup="menu"
                      @click="toggleExportMenu"
                    >
                      <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                      <span>导出</span>
                      <svg
                        class="h-3 w-3 transition-transform"
                        :class="isExportOpen ? 'rotate-180' : ''"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        aria-hidden="true"
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </button>

                    <Transition name="knowledge-export-fade">
                      <div
                        v-if="isExportOpen"
                        class="knowledge-export-menu absolute right-0 top-full z-20 mt-2 w-48 overflow-hidden rounded-2xl border border-slate-200 bg-white py-1.5 shadow-lg shadow-slate-200/60"
                        role="menu"
                      >
                        <button
                          v-for="option in exportOptions"
                          :key="option.format"
                          type="button"
                          class="knowledge-export-item flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-xs text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
                          role="menuitem"
                          @click="handleExport(option.format)"
                        >
                          <svg class="h-3.5 w-3.5 flex-none text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                          </svg>
                          <span>{{ option.label }}</span>
                          <span class="knowledge-export-item-ext ml-auto text-[10px] uppercase tracking-wide text-slate-400">{{ option.extension }}</span>
                        </button>
                      </div>
                    </Transition>
                  </div>
                </div>

                <div class="mt-4 flex flex-wrap gap-2">
                  <span
                    v-for="tag in currentDoc.tags"
                    :key="tag"
                    class="knowledge-content-tag rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-500"
                  >
                    {{ tag }}
                  </span>
                </div>

                <h2 class="knowledge-content-title mt-5 text-2xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                  {{ currentDoc.title }}
                </h2>
                <p class="knowledge-content-summary mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base sm:leading-8">
                  {{ currentDoc.summary }}
                </p>
              </header>

              <div v-if="tocItems.length" class="doc-toc-inline mb-8 rounded-2xl border border-slate-200 bg-slate-50 2xl:hidden">
                <button
                  type="button"
                  class="flex w-full items-center justify-between px-4 py-3 text-sm font-medium text-slate-700"
                  :aria-expanded="isTocOpen"
                  @click="isTocOpen = !isTocOpen"
                >
                  <span>目录 · 共 {{ tocItems.length }} 节</span>
                  <svg
                    class="h-4 w-4 transition-transform"
                    :class="isTocOpen ? 'rotate-180' : ''"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    aria-hidden="true"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
                <div v-show="isTocOpen" class="max-h-72 overflow-y-auto px-4 pb-4">
                  <DocToc :items="tocItems" :active-id="activeHeadingId" @jump="handleTocJump" />
                </div>
              </div>

              <div v-if="renderingMarkdown" class="space-y-4">
                <AppSkeletonLines :rows="7" />
                <AppSkeletonLines :rows="7" />
              </div>
              <div
                v-else
                class="markdown-body knowledge-markdown"
                v-html="renderedContent"
                @click="handleArticleClick"
              />

              <DocFooterNav
                :prev-doc="prevDoc"
                :next-doc="nextDoc"
                :related-docs="relatedDocs"
                @select="docsStore.setActiveDoc"
              />

              <DocComments :key="currentDoc.id" :doc-id="currentDoc.id" />
            </template>

            <AppEmptyState v-else title="暂无预览内容" description="从左侧选一篇文档，右侧会立即渲染 Markdown 内容。" />
          </article>
        </div>

        <!-- 外层占满整列高度（self-stretch），内层卡片 sticky：粘性空间=整篇文章高度，滚到底也不撞出视口 -->
        <aside v-if="tocItems.length" class="hidden 2xl:block w-56 flex-none 2xl:self-stretch">
          <div class="doc-toc-aside 2xl:sticky 2xl:top-24">
            <p class="doc-toc-heading">目录</p>
            <div class="doc-toc-aside-scroll mt-3 max-h-[60vh] overflow-y-auto pr-1">
              <DocToc :items="tocItems" :active-id="activeHeadingId" @jump="handleTocJump" />
            </div>
          </div>
        </aside>
      </section>
    </div>

    <KnowledgeLightbox
      :open="lightbox.open"
      :src="lightbox.src"
      :alt="lightbox.alt"
      @close="lightbox.open = false"
    />
  </div>
</template>
