<script setup lang="ts">
import type { KnowledgeDoc } from '@/types/content'

defineProps<{
  // 更早的一篇（列表顺序的下一篇）
  prevDoc?: KnowledgeDoc | null
  // 更新的一篇
  nextDoc?: KnowledgeDoc | null
  relatedDocs: KnowledgeDoc[]
}>()

const emit = defineEmits<{
  select: [docId: string]
}>()
</script>

<template>
  <div
    v-if="prevDoc || nextDoc || relatedDocs.length"
    class="doc-footer-nav mt-12 border-t border-slate-200 pt-8 sm:mt-14"
  >
    <div v-if="relatedDocs.length" class="mb-8">
      <p class="doc-footer-title text-sm font-semibold text-slate-900">相关阅读</p>
      <div class="mt-3 grid gap-3 sm:grid-cols-2">
        <button
          v-for="doc in relatedDocs"
          :key="doc.id"
          type="button"
          class="doc-footer-card rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-left transition hover:-translate-y-0.5 hover:bg-white hover:shadow-sm"
          @click="emit('select', doc.id)"
        >
          <span class="doc-footer-card-title line-clamp-1 text-sm font-medium text-slate-800">{{ doc.title }}</span>
          <span class="mt-1 block text-xs text-slate-400">{{ doc.createTime }} · {{ doc.tags[0] ?? '文档' }}</span>
        </button>
      </div>
    </div>

    <div class="grid gap-3 sm:grid-cols-2">
      <button
        v-if="prevDoc"
        type="button"
        class="doc-footer-card rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-left transition hover:-translate-y-0.5 hover:bg-white hover:shadow-sm"
        @click="emit('select', prevDoc.id)"
      >
        <span class="doc-footer-card-label block text-xs text-slate-400">← 上一篇（更早）</span>
        <span class="doc-footer-card-title mt-1 line-clamp-1 block text-sm font-medium text-slate-800">{{ prevDoc.title }}</span>
      </button>

      <button
        v-if="nextDoc"
        type="button"
        class="doc-footer-card rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-right transition hover:-translate-y-0.5 hover:bg-white hover:shadow-sm sm:col-start-2"
        @click="emit('select', nextDoc.id)"
      >
        <span class="doc-footer-card-label block text-xs text-slate-400">下一篇（更新）→</span>
        <span class="doc-footer-card-title mt-1 line-clamp-1 block text-sm font-medium text-slate-800">{{ nextDoc.title }}</span>
      </button>
    </div>
  </div>
</template>
