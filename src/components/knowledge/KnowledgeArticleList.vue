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
      <div class="flex items-start justify-between gap-4">
        <div>
          <p class="knowledge-sidebar-title text-sm font-semibold tracking-[0.08em] text-gray-900">文档列表</p>
          <p class="knowledge-sidebar-copy mt-1 text-xs leading-5 text-gray-500">{{ resultText }}</p>
        </div>
        <span
            class="knowledge-sidebar-count inline-flex min-w-9 items-center justify-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600"
        >
          {{ docs.length }}
        </span>
      </div>

      <label class="knowledge-sidebar-search mt-5 block">
        <span class="sr-only">搜索文档</span>
        <div class="app-public-input flex items-center gap-3 rounded-2xl px-4 py-3">
          <svg viewBox="0 0 24 24" class="h-4 w-4 shrink-0 text-slate-400" fill="none" stroke="currentColor" stroke-width="1.8">
            <circle cx="11" cy="11" r="6.5" />
            <path d="m16 16 4.5 4.5" />
          </svg>
          <input
            :value="keyword"
            type="text"
            class="min-w-0 flex-1 border-0 bg-transparent p-0 text-sm text-slate-700 outline-none placeholder:text-slate-400"
            placeholder="搜索标题、标签或正文"
            @input="emit('update:keyword', ($event.target as HTMLInputElement).value)"
          />
          <button
            v-if="keyword"
            type="button"
            class="text-xs font-medium text-slate-400 transition hover:text-slate-700"
            @click="emit('update:keyword', '')"
          >
            清空
          </button>
        </div>
      </label>

      <div class="mt-5 xl:min-h-0 xl:flex-1">
        <div v-if="loading" class="space-y-4">
          <div
            v-for="index in 4"
            :key="index"
            class="rounded-2xl border border-slate-200 bg-white px-4 py-4"
          >
            <AppSkeletonLines :rows="3" />
          </div>
        </div>

        <div
          v-else-if="docs.length"
          class="knowledge-doc-list space-y-3 xl:h-full xl:overflow-y-auto xl:pr-2"
        >
          <button
            v-for="doc in docs"
            :key="doc.id"
            class="knowledge-list-item w-full rounded-2xl border border-slate-200 bg-white px-3 py-3 text-left transition duration-200 hover:-translate-y-0.5 hover:bg-gray-50 hover:shadow-sm sm:px-4 sm:py-4"
            :class="
              activeDocId === doc.id
                ? 'is-active border-blue-100 border-l-4 border-l-blue-500 bg-blue-50 shadow-sm'
                : ''
            "
            @click="emit('select', doc.id)"
          >
            <div class="flex items-start justify-between gap-3">
              <h3
                class="knowledge-list-item-title line-clamp-2 text-sm font-medium leading-6"
                :class="activeDocId === doc.id ? 'text-blue-950' : 'text-gray-900'"
              >
                {{ doc.title }}
              </h3>
              <span class="knowledge-list-item-date shrink-0 text-[11px] text-gray-400">{{ doc.createTime }}</span>
            </div>

            <p v-if="isSnippetHit(doc)" class="knowledge-list-item-snippet mt-2 line-clamp-2 text-sm leading-6 text-gray-600">
              {{ doc.snippet?.before }}<mark class="snippet-hit">{{ doc.snippet?.hit }}</mark>{{ doc.snippet?.after }}
            </p>
            <p v-else class="knowledge-list-item-summary mt-2 line-clamp-2 text-sm leading-6 text-gray-500">
              {{ doc.summary }}
            </p>

            <div class="mt-3 flex flex-wrap gap-2">
              <!-- button 内不允许再嵌交互元素，标签用 span 承载点击 -->
              <span
                v-for="tag in doc.tags"
                :key="tag"
                role="button"
                tabindex="0"
                class="knowledge-list-chip knowledge-list-chip--clickable rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] text-slate-500"
                :title="`筛选「${tag}」相关文档`"
                @click.stop="handleTagClick(tag)"
                @keydown.enter.stop="handleTagClick(tag)"
              >
                {{ tag }}
              </span>
              <span
                v-if="isContentMatch(doc)"
                class="knowledge-list-chip knowledge-list-chip--match rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] text-slate-500"
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
