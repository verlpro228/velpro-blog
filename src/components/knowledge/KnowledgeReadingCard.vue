<script setup lang="ts">
import { computed, ref } from 'vue'
import { useReadingStore } from '@/store/modules/reading'
import { useDocsStore } from '@/store/modules/docs'

const emit = defineEmits<{
  select: [docId: string]
}>()

const readingStore = useReadingStore()
const docsStore = useDocsStore()

const activeTab = ref<'history' | 'starred'>('history')

const items = computed(() => {
  if (activeTab.value === 'starred') {
    return readingStore.starredIds
      .map((id) => {
        const doc = docsStore.docs.find((item) => item.id === id)
        return doc ? { id, title: doc.title, readAt: 0 } : null
      })
      .filter((item): item is { id: string; title: string; readAt: number } => item !== null)
  }

  return readingStore.history.filter((item) => docsStore.docs.some((doc) => doc.id === item.id))
})

function formatTime(timestamp: number) {
  const date = new Date(timestamp)
  return `${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}
</script>

<template>
  <div class="knowledge-reading-card rounded-[1.75rem] border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
    <div class="flex items-center justify-between gap-3">
      <div class="flex items-center gap-1">
        <button
          type="button"
          class="knowledge-reading-tab rounded-full px-3 py-1 text-xs font-medium transition"
          :class="activeTab === 'history' ? 'is-active' : ''"
          @click="activeTab = 'history'"
        >
          最近阅读
        </button>
        <button
          type="button"
          class="knowledge-reading-tab rounded-full px-3 py-1 text-xs font-medium transition"
          :class="activeTab === 'starred' ? 'is-active' : ''"
          @click="activeTab = 'starred'"
        >
          我的收藏
        </button>
      </div>
      <div class="flex items-center gap-2">
        <button
          v-if="activeTab === 'history' && items.length"
          type="button"
          class="knowledge-reading-clear text-[11px] text-slate-400 transition hover:text-rose-500"
          title="清空全部阅读记录"
          @click="readingStore.clearHistory()"
        >
          清空
        </button>
        <span class="knowledge-sidebar-count inline-flex items-center justify-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[11px] font-semibold text-slate-500">
          {{ items.length }}
        </span>
      </div>
    </div>

    <!-- 固定只显示 2 条（约 72px），更多记录在卡片内上下滚动查看 -->
    <div class="knowledge-reading-list mt-3 max-h-[72px] space-y-1 overflow-y-auto">
      <button
        v-for="item in items"
        :key="item.id"
        type="button"
        class="knowledge-reading-item flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-left transition"
        @click="emit('select', item.id)"
      >
        <span class="knowledge-reading-item-title min-w-0 flex-1 truncate text-xs font-medium text-slate-700">{{ item.title }}</span>
        <span v-if="activeTab === 'history'" class="flex-none text-[10px] tabular-nums text-slate-400">
          {{ formatTime(item.readAt) }}
        </span>
        <svg v-else class="h-3 w-3 flex-none text-amber-400" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
        <!-- button 内不允许再嵌交互元素，删除按钮用 span 承载点击 -->
        <span
          v-if="activeTab === 'history'"
          role="button"
          tabindex="0"
          class="knowledge-reading-remove flex h-4 w-4 flex-none items-center justify-center rounded-full transition"
          :title="`删除「${item.title}」记录`"
          @click.stop="readingStore.removeHistory(item.id)"
          @keydown.enter.stop="readingStore.removeHistory(item.id)"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true">
            <line x1="6" y1="6" x2="18" y2="18" />
            <line x1="18" y1="6" x2="6" y2="18" />
          </svg>
        </span>
      </button>

      <p v-if="!items.length" class="px-2.5 py-3 text-center text-xs leading-5 text-slate-400">
        {{ activeTab === 'history' ? '读过的文章会出现在这里' : '在文章顶部点击星标即可收藏' }}
      </p>
    </div>
  </div>

</template>
