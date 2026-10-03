<script setup lang="ts">
import { computed } from 'vue'
import AppEmptyState from '@/components/common/AppEmptyState.vue'
import AppSkeletonLines from '@/components/common/AppSkeletonLines.vue'
import type { SearchableDoc } from '@/hooks/useKnowledgeSearch'

const props = defineProps<{
  docs: SearchableDoc[]
  activeDocId: string
  loading: boolean
  keyword: string
  resultText: string
  loadError?: boolean
}>()

const emit = defineEmits<{
  'update:keyword': [value: string]
  select: [docId: string]
  retry: []
}>()

// 标签可点击筛选：阻断冒泡，避免触发卡片本身的"选中文档"
function handleTagClick(tag: string) {
  emit('update:keyword', tag)
}

// 全文预热后 content 有值；命中正文但标题/标签未必命中时给出提示
// 忽略空格与大小写：正文常见"虚拟 DOM"这类中英文混排写法
const normalizedKeyword = computed(() => props.keyword.trim().toLowerCase().replace(/\s+/g, ""))

function isContentMatch(doc: SearchableDoc) {
  const content = (doc.content ?? "").toLowerCase().replace(/\s+/g, "")
  return Boolean(normalizedKeyword.value) && content.includes(normalizedKeyword.value)
}

function isSnippetHit(doc: SearchableDoc) {
  return Boolean(normalizedKeyword.value && doc.snippet)
}
</script>

<template>
  <aside class="xl:h-full">
    <div
      class="knowledge-sidebar-card rounded-[1.75rem] border border-slate-200 bg-white p-4 shadow-sm sm:p-5 xl:flex xl:h-full xl:min-h-0 xl:flex-col"
    >
      <!-- 标题 / 搜索框 / 计数徽章三者同行垂直居中对齐 -->
      <div class="flex items-center gap-2">
        <p class="knowledge-sidebar-title shrink-0 text-sm font-semibold tracking-[0.08em] text-gray-900">文档列表</p>
        <label class="min-w-0 flex-1">
          <span class="sr-only">搜索文档</span>
          <div class="app-public-input flex items-center gap-2 rounded-full px-3 py-1.5">
            <svg viewBox="0 0 24 24" class="h-3.5 w-3.5 shrink-0 text-slate-400" fill="none" stroke="currentColor" stroke-width="1.8">
              <circle cx="11" cy="11" r="6.5" />
              <path d="m16 16 4.5 4.5" />
            </svg>
            <input
              :value="keyword"
              type="text"
              class="min-w-0 flex-1 border-0 bg-transparent p-0 text-xs text-slate-700 outline-none placeholder:text-slate-400"
              placeholder="搜索标题、标签或正文"
              @input="emit('update:keyword', ($event.target as HTMLInputElement).value)"
            />
            <button
              v-if="keyword"
              type="button"
              class="text-[10px] font-medium text-slate-400 transition hover:text-slate-700"
              @click="emit('update:keyword', '')"
            >
              清空
            </button>
          </div>
        </label>
        <span
            class="knowledge-sidebar-count inline-flex min-w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600"
        >
          {{ docs.length }}
        </span>
      </div>
      <p class="knowledge-sidebar-copy mt-1 truncate text-xs leading-5 text-gray-500">{{ resultText }}</p>

      <!-- 列表撑满左栏剩余高度，文档多时内部滚动（小屏限高） -->
      <div class="mt-4 xl:min-h-0 xl:flex-1">
        <div v-if="loading" class="space-y-3">
          <div
            v-for="index in 2"
            :key="index"
            class="rounded-2xl border border-slate-200 bg-white px-4 py-4"
          >
            <AppSkeletonLines :rows="2" />
          </div>
        </div>

        <div
          v-else-if="docs.length"
          class="knowledge-doc-list max-h-[420px] space-y-2.5 overflow-y-auto pr-1 xl:h-full xl:max-h-none"
        >
          <button
            v-for="doc in docs"
            :key="doc.id"
            class="knowledge-list-item w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-left transition duration-200 hover:-translate-y-0.5 hover:bg-gray-50 hover:shadow-sm"
            :class="
              activeDocId === doc.id
                ? 'is-active border-blue-100 border-l-4 border-l-blue-500 bg-blue-50 shadow-sm'
                : ''
            "
            @click="emit('select', doc.id)"
          >
            <div class="flex items-center justify-between gap-3">
              <h3
                class="knowledge-list-item-title min-w-0 flex-1 truncate text-sm font-medium leading-5"
                :class="activeDocId === doc.id ? 'text-blue-950' : 'text-gray-900'"
              >
                {{ doc.title }}
              </h3>
              <span class="knowledge-list-item-date shrink-0 text-[11px] text-gray-400">{{ doc.createTime }}</span>
            </div>

            <div class="mt-1.5 flex h-[22px] flex-wrap gap-1.5 overflow-hidden">
              <!-- button 内不允许再嵌交互元素，标签用 span 承载点击 -->
              <span
                v-for="tag in doc.tags"
                :key="tag"
                role="button"
                tabindex="0"
                class="knowledge-list-chip knowledge-list-chip--clickable rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] leading-4 text-slate-500"
                :title="`筛选「${tag}」相关文档`"
                @click.stop="handleTagClick(tag)"
                @keydown.enter.stop="handleTagClick(tag)"
              >
                {{ tag }}
              </span>
              <span
                v-if="isContentMatch(doc)"
                class="knowledge-list-chip knowledge-list-chip--match rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] leading-4 text-slate-500"
              >
                正文匹配
              </span>
            </div>
          </button>
        </div>

        <div v-else-if="loadError" class="knowledge-error-box mt-6 rounded-2xl border px-4 py-6 text-center">
          <p class="text-sm font-semibold">文档加载失败</p>
          <p class="mt-1.5 text-xs leading-5 opacity-80">可能是网络波动或服务冷启动，稍等片刻再试。</p>
          <button
            type="button"
            class="knowledge-error-retry mt-4 rounded-full border px-5 py-1.5 text-xs font-medium transition"
            @click="emit('retry')"
          >
            重新加载
          </button>
        </div>

        <AppEmptyState v-else class="mt-6" title="没有匹配文档" description="换个关键词试试，或者先在后台补充一篇新内容。" />
      </div>
    </div>
  </aside>
</template>
