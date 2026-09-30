<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import Fuse from 'fuse.js'
import { useDocsStore } from '@/store/modules/docs'
import { useReadingStore } from '@/store/modules/reading'
import { extractSnippet, extractSnippetFromIndices, type SnippetParts } from '@/utils/searchSnippet'

interface PaletteResult {
  id: string
  title: string
  summary: string
  snippet?: SnippetParts
  matchedFrom: 'content' | 'meta'
}

const router = useRouter()
const docsStore = useDocsStore()
const readingStore = useReadingStore()

const open = ref(false)
const keyword = ref('')
const activeIndex = ref(0)
const inputRef = ref<HTMLInputElement | null>(null)

const searchEngine = computed(
  () =>
    new Fuse(docsStore.docs, {
      keys: ['title', 'tags', 'content'],
      threshold: 0.3,
      ignoreLocation: true,
      includeMatches: true,
    }),
)

const results = computed<PaletteResult[]>(() => {
  const value = keyword.value.trim()

  if (!value) {
    return []
  }

  return searchEngine.value
    .search(value)
    .slice(0, 8)
    .map((match) => {
      const doc = match.item
      const lowerValue = value.toLowerCase()
      const matchedFrom: PaletteResult['matchedFrom'] =
        doc.title.toLowerCase().includes(lowerValue) || doc.tags.some((tag) => tag.toLowerCase().includes(lowerValue))
          ? 'meta'
          : 'content'

      const contentMatch = match.matches?.find((entry) => entry.key === 'content')
      const snippet =
        extractSnippet(doc.content ?? '', value) ??
        (contentMatch ? extractSnippetFromIndices(contentMatch.value ?? '', contentMatch.indices) : null)

      return {
        id: doc.id,
        title: doc.title,
        summary: doc.summary,
        snippet: snippet ?? undefined,
        matchedFrom,
      }
    })
})

// 无关键词时展示最近阅读，作为快捷入口
const recentDocs = computed(() =>
  readingStore.history
    .slice(0, 5)
    .map((item) => docsStore.docs.find((doc) => doc.id === item.id))
    .filter((doc): doc is NonNullable<typeof doc> => Boolean(doc)),
)

const flatItems = computed(() =>
  keyword.value.trim() ? results.value : recentDocs.value.map((doc) => ({ id: doc.id, title: doc.title, summary: doc.summary, matchedFrom: 'meta' as const })),
)

function openPalette() {
  open.value = true
  keyword.value = ''
  activeIndex.value = 0

  if (!docsStore.docs.length) {
    void docsStore.fetchDocs()
  }

  void nextTick(() => {
    inputRef.value?.focus()
  })
}

function closePalette() {
  open.value = false
}

function goDoc(docId: string) {
  closePalette()
  docsStore.setActiveDoc(docId)

  const current = router.currentRoute.value
  const currentId = typeof current.params.id === 'string' ? current.params.id : ''

  // 已在同一篇文章上就不重复 push，避免产生多余的历史记录
  if (current.name === 'knowledge' && currentId === docId) {
    return
  }

  void router.push({ name: 'knowledge', params: { id: docId } })
}

function onKeydown(event: KeyboardEvent) {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault()
    open.value ? closePalette() : openPalette()
    return
  }

  if (!open.value) {
    return
  }

  if (event.key === 'Escape') {
    event.preventDefault()
    closePalette()
    return
  }

  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault()
    const total = flatItems.value.length

    if (!total) {
      return
    }

    const delta = event.key === 'ArrowDown' ? 1 : -1
    activeIndex.value = (activeIndex.value + delta + total) % total
    return
  }

  if (event.key === 'Enter') {
    event.preventDefault()
    const item = flatItems.value[activeIndex.value]

    if (item) {
      goDoc(item.id)
    }
  }
}

watch(keyword, () => {
  activeIndex.value = 0
})

watch(open, (value) => {
  if (typeof document === 'undefined') {
    return
  }

  document.body.style.overflow = value ? 'hidden' : ''
})

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
  // 导航栏搜索按钮等外部入口通过该事件打开面板
  window.addEventListener('palette:open', openPalette as EventListener)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
  window.removeEventListener('palette:open', openPalette as EventListener)
  document.body.style.overflow = ''
})
</script>

<template>
  <Teleport to="body">
    <Transition name="palette-fade">
      <div v-if="open" class="palette-overlay" @click="closePalette">
        <div class="palette-panel" role="dialog" aria-modal="true" aria-label="全局搜索" @click.stop>
          <div class="palette-input-row">
            <svg class="palette-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true">
              <circle cx="11" cy="11" r="6.5" />
              <path d="m16 16 4.5 4.5" />
            </svg>
            <input
              ref="inputRef"
              v-model="keyword"
              type="text"
              class="palette-input"
              placeholder="搜索文章标题、标签或正文…"
              @keydown.stop
            >
            <button type="button" class="palette-esc" title="关闭" @click="closePalette">Esc</button>
          </div>

          <div class="palette-results">
            <template v-if="keyword.trim()">
              <p class="palette-group-label">搜索结果（{{ results.length }}）</p>
              <button
                v-for="(item, index) in results"
                :key="item.id"
                type="button"
                class="palette-item"
                :class="{ 'is-active': index === activeIndex }"
                :data-active="index === activeIndex"
                @mousemove="activeIndex = index"
                @click="goDoc(item.id)"
              >
                <span class="palette-item-title">{{ item.title }}</span>
                <span v-if="item.snippet" class="palette-item-desc">
                  {{ item.snippet.before }}<mark class="snippet-hit">{{ item.snippet.hit }}</mark>{{ item.snippet.after }}
                </span>
                <span v-else class="palette-item-desc">{{ item.matchedFrom === 'content' ? '正文匹配 · ' : '' }}{{ item.summary }}</span>
              </button>

              <p v-if="!results.length" class="palette-empty">
                {{ docsStore.loading ? '正在加载文档…' : '没有匹配的文章，换个关键词试试' }}
              </p>
            </template>

            <template v-else>
              <p class="palette-group-label">最近阅读</p>
              <button
                v-for="(item, index) in recentDocs"
                :key="item.id"
                type="button"
                class="palette-item"
                :class="{ 'is-active': index === activeIndex }"
                :data-active="index === activeIndex"
                @mousemove="activeIndex = index"
                @click="goDoc(item.id)"
              >
                <span class="palette-item-title">{{ item.title }}</span>
                <span class="palette-item-desc">{{ item.summary }}</span>
              </button>

              <p v-if="!recentDocs.length" class="palette-empty">
                {{ docsStore.loading ? '正在加载文档…' : '输入关键词搜索，或阅读文章后从这里快速回到它' }}
              </p>
            </template>
          </div>

          <div class="palette-footer">
            <span><kbd>↑</kbd><kbd>↓</kbd> 切换</span>
            <span><kbd>Enter</kbd> 打开</span>
            <span><kbd>Esc</kbd> 关闭</span>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
