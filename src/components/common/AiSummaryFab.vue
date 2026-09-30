<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { onClickOutside } from '@vueuse/core'
import { showToast } from '@/utils/toast'
import { useAiSummary } from '@/hooks/useAiSummary'
import { useDocsStore } from '@/store/modules/docs'

const route = useRoute()
const docsStore = useDocsStore()

const { aiSummary, aiSummaryState, aiSummaryError, generate, dismiss, refresh, copySummary } = useAiSummary()

const isOpen = ref(false)
const fabRef = ref<HTMLElement | null>(null)

const currentDoc = computed(() => docsStore.currentDoc)

// 仅在知识库页且有当前文章时显示（AI 总结需要文章全文）。
// 用路由名而非 path 判断：文章页是 /knowledge/doc-xxx，path 不再等于 '/knowledge'
const visible = computed(
  () => route.name === 'knowledge' && Boolean(currentDoc.value?.content?.trim()),
)

onClickOutside(fabRef, () => {
  isOpen.value = false
})

function toggle() {
  isOpen.value = !isOpen.value

  // 首次展开且未生成过时自动开始流式生成
  if (isOpen.value && aiSummaryState.value === 'idle' && currentDoc.value) {
    void generate(currentDoc.value)
  }
}

function handleCopy() {
  void copySummary().then(() => {
    showToast('摘要已复制到剪贴板', { type: 'success' })
  })
}

// 切换文章时收起下拉（摘要状态由 KnowledgeView 的 watch 通过 restoreFor 维护）
watch(
  () => currentDoc.value?.id,
  () => {
    isOpen.value = false
  },
)
</script>

<template>
  <div v-if="visible" ref="fabRef" class="ai-summary-fab-wrap">
    <button
      type="button"
      class="ai-summary-fab"
      title="AI 总结本文（点击展开）"
      @click="toggle"
    >
      <svg class="ai-summary-fab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3z" />
        <path d="M19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15z" />
      </svg>
      <span class="ai-summary-fab-label">AI 总结</span>
      <span
        v-if="aiSummaryState === 'loading' && !isOpen"
        class="ai-summary-fab-dot"
        aria-hidden="true"
      />
    </button>

    <Transition name="ai-summary-pop">
      <div v-if="isOpen" class="ai-summary-dropdown" role="dialog" aria-label="AI 摘要">
        <div class="ai-summary-dropdown-head">
          <p class="ai-summary-dropdown-title">
            <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3z" />
            </svg>
            AI 摘要
          </p>
          <button type="button" class="ai-summary-dropdown-close" title="收起" @click="isOpen = false">×</button>
        </div>

        <p class="ai-summary-dropdown-doc">{{ currentDoc?.title }}</p>

        <div class="ai-summary-dropdown-body">
          <p v-if="aiSummaryError" class="text-sm leading-6 text-rose-500">{{ aiSummaryError }}</p>
          <p v-else class="whitespace-pre-wrap text-sm leading-7">
            {{ aiSummary }}<span v-if="aiSummaryState === 'loading'" class="ai-summary-cursor" aria-hidden="true">▍</span>
          </p>

          <p v-if="aiSummaryState === 'loading'" class="mt-2 text-[11px] text-slate-400">生成中，请稍候…</p>
        </div>

        <div class="ai-summary-dropdown-actions">
          <button
            type="button"
            class="ai-summary-action"
            :disabled="aiSummaryState !== 'done'"
            title="复制摘要"
            @click="handleCopy"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <rect x="9" y="9" width="13" height="13" rx="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
            复制
          </button>
          <button
            type="button"
            class="ai-summary-action"
            :disabled="aiSummaryState === 'loading' || !currentDoc"
            @click="currentDoc && refresh(currentDoc)"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M21 12a9 9 0 1 1-2.64-6.36" />
              <polyline points="21 3 21 9 15 9" />
            </svg>
            重新生成
          </button>
          <button
            type="button"
            class="ai-summary-action"
            :disabled="aiSummaryState === 'idle'"
            @click="dismiss"
          >
            收起摘要
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>
