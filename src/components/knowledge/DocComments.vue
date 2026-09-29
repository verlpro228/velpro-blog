<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { GISCUS_CONFIG } from '@/constants/app'
import { useTheme } from '@/hooks/useTheme'

const props = defineProps<{
  docId: string
  // 自定义讨论串标识（如留言板 "guestbook"）；不传则按文档粒度生成 term = doc:{docId}
  term?: string
}>()

const { isDark } = useTheme()

// repoId / categoryId 未配置（constants/app.ts 的 GISCUS_CONFIG）时不渲染整个评论区
const enabled = Boolean(GISCUS_CONFIG.repoId && GISCUS_CONFIG.categoryId)

const containerRef = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null

const themeName = () => (isDark.value ? 'dark' : 'light')

function postTheme() {
  const iframe = containerRef.value?.querySelector<HTMLIFrameElement>('iframe.giscus-frame')
  iframe?.contentWindow?.postMessage(
    { giscus: { setConfig: { theme: themeName() } } },
    'https://giscus.app',
  )
}

function loadWidget() {
  const container = containerRef.value

  if (!container || container.childElementCount) {
    return
  }

  const script = document.createElement('script')
  script.src = 'https://giscus.app/client.js'
  script.async = true
  script.crossOrigin = 'anonymous'

  const term = props.term ?? `${GISCUS_CONFIG.termPrefix}${props.docId}`
  const params: Record<string, string> = {
    'data-repo': GISCUS_CONFIG.repo,
    'data-repo-id': GISCUS_CONFIG.repoId,
    'data-category': GISCUS_CONFIG.category,
    'data-category-id': GISCUS_CONFIG.categoryId,
    // Hash 路由下 pathname 恒为 /，用 specific + term 保证每篇/每页一个独立讨论串
    'data-mapping': 'specific',
    'data-term': term,
    'data-strict': '0',
    'data-reactions-enabled': '1',
    'data-emit-metadata': '0',
    'data-input-position': 'top',
    'data-theme': themeName(),
    'data-lang': 'zh-CN',
    'data-loading': 'lazy',
  }

  for (const [key, value] of Object.entries(params)) {
    script.setAttribute(key, value)
  }

  container.appendChild(script)
}

onMounted(() => {
  if (!enabled) {
    return
  }

  // 滚动到评论区附近再加载 giscus，不拖慢文章首屏
  observer = new IntersectionObserver(
    (entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        loadWidget()
        observer?.disconnect()
        observer = null
      }
    },
    { rootMargin: '240px' },
  )

  if (containerRef.value) {
    observer.observe(containerRef.value)
  }
})

watch(isDark, () => {
  postTheme()
})

onBeforeUnmount(() => {
  observer?.disconnect()
  observer = null
})
</script>

<template>
  <section v-if="enabled" class="doc-comments mt-12 border-t border-slate-200 pt-8 sm:mt-14">
    <p class="doc-footer-title text-sm font-semibold text-slate-900">评论</p>
    <p class="mt-1.5 text-xs leading-5 text-slate-500">评论基于 GitHub Discussions，使用 GitHub 账号登录后即可参与讨论。</p>
    <div ref="containerRef" class="doc-comments-container mt-4 min-h-16" />
  </section>
</template>
