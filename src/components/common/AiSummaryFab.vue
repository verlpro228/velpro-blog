<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { onClickOutside, useEventListener } from '@vueuse/core'
import { STORAGE_KEYS } from '@/constants/app'
import { showToast } from '@/utils/toast'
import { useAiSummary } from '@/hooks/useAiSummary'
import { useDraggableFab } from '@/hooks/useDraggableFab'
import { useDocsStore } from '@/store/modules/docs'

const route = useRoute()
const docsStore = useDocsStore()

const { aiSummary, aiSummaryState, aiSummaryError, generate, refresh, copySummary } = useAiSummary()

const isOpen = ref(false)
const fabRef = ref<HTMLElement | null>(null)

// 悬浮按钮可拖拽：位置记忆 + 左右磁吸停靠；下拉面板随停靠方向自动换边
const {
  side: fabSide,
  dragging: fabDragging,
  style: fabStyle,
  onPointerDown: onFabPointerDown,
  onClickCapture: onFabClickCapture,
} = useDraggableFab(
  { storageKey: STORAGE_KEYS.aiSummaryFabPos, defaultAnchor: { right: 16, bottom: -132 } },
  fabRef,
)

const currentDoc = computed(() => docsStore.currentDoc)

// 下拉面板展开方向自适应：球被拖到屏幕下半部时固定向下展开会整体溢出视口（只剩一点，
// 用户需把球往外拖才能看到）。展开/窗口变化/拖拽结束时按球的视口位置决定向上还是向下弹，
// 并把面板 max-height 夹紧到所在侧的可用空间内
const dropUp = ref(false)
const panelMaxHeight = ref<number | null>(null)

const PANEL_GAP_PX = 10
const PANEL_MAX_PX = 520
const VIEWPORT_MARGIN_PX = 12

function updatePanelPlacement() {
  const el = fabRef.value
  if (!el) {
    return
  }

  const rect = el.getBoundingClientRect()
  const spaceBelow = window.innerHeight - rect.bottom - PANEL_GAP_PX - VIEWPORT_MARGIN_PX
  const spaceAbove = rect.top - PANEL_GAP_PX - VIEWPORT_MARGIN_PX
  const preferred = Math.min(PANEL_MAX_PX, window.innerHeight - 192)

  if (spaceBelow >= preferred || spaceBelow >= spaceAbove) {
    dropUp.value = false
    panelMaxHeight.value = Math.max(Math.min(preferred, spaceBelow), 160)
  } else {
    dropUp.value = true
    panelMaxHeight.value = Math.max(Math.min(preferred, spaceAbove), 160)
  }
}

watch(isOpen, (open) => {
  if (open) {
    updatePanelPlacement()
  }
})

// 拖拽结束（位置可能大幅变化）与窗口尺寸变化时，面板若开着则重新计算放置
watch(fabDragging, (dragging) => {
  if (!dragging && isOpen.value) {
    updatePanelPlacement()
  }
})

useEventListener(window, 'resize', () => {
  if (isOpen.value) {
    updatePanelPlacement()
  }
})

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
  <div
    v-if="visible"
    ref="fabRef"
    class="ai-summary-fab-wrap"
    :class="[`is-${fabSide}`, { 'is-dragging': fabDragging }]"
    :style="fabStyle"
    @click.capture="onFabClickCapture"
  >
    <button
      type="button"
      class="ai-summary-fab"
      title="AI 总结本文（点击展开，按住可拖动）"
      @click="toggle"
      @pointerdown="onFabPointerDown"
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
      <div
        v-if="isOpen"
        class="ai-summary-dropdown"
        :class="{ 'is-drop-up': dropUp }"
        :style="panelMaxHeight ? { maxHeight: `${panelMaxHeight}px` } : undefined"
        role="dialog"
        aria-label="AI 摘要"
      >
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
            @click="isOpen = false"
          >
            收起摘要
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>
