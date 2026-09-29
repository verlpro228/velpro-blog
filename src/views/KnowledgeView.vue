<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { onClickOutside } from '@vueuse/core'
import AppEmptyState from '@/components/common/AppEmptyState.vue'
import AppSkeletonLines from '@/components/common/AppSkeletonLines.vue'
import ProgressBar from '@/components/common/ProgressBar.vue'
import KnowledgeArticleList from '@/components/knowledge/KnowledgeArticleList.vue'
import { useAsyncMarkdown } from '@/hooks/useAsyncMarkdown'
import { useKnowledgeSearch } from '@/hooks/useKnowledgeSearch'
import { useReadingProgress } from '@/hooks/useReadingProgress'
import { useDocsStore } from '@/store/modules/docs'
import { showToast } from '@/utils/toast'
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

const { html: renderedContent, loading: renderingMarkdown } = useAsyncMarkdown(markdownSource)

const { keyword, debouncedKeyword, results: visibleDocs, isSearching } = useKnowledgeSearch(
  visibleSource,
  docsStore.keyword,
  docsStore.setKeyword,
)

const { progress, syncHeadings, update, reset } = useReadingProgress(articleContainerRef, {
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
  async (docId) => {
    if (!docId) {
      return
    }

    await nextTick()
    reset({ behavior: 'auto' })
    update()
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

    <div class="mx-auto max-w-screen-xl">
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
            @update:keyword="keyword = $event"
            @select="docsStore.setActiveDoc"
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

              <div v-if="renderingMarkdown" class="space-y-4">
                <AppSkeletonLines :rows="7" />
                <AppSkeletonLines :rows="7" />
              </div>
              <div v-else class="markdown-body knowledge-markdown" v-html="renderedContent" />
            </template>

            <AppEmptyState v-else title="暂无预览内容" description="从左侧选一篇文档，右侧会立即渲染 Markdown 内容。" />
          </article>
        </div>
      </section>
    </div>
  </div>
</template>
