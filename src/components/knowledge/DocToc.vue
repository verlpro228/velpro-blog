<script setup lang="ts">
import type { TocItem } from '@/types/content'

defineProps<{
  items: TocItem[]
  activeId: string
}>()

const emit = defineEmits<{
  jump: [id: string]
}>()
</script>

<template>
  <nav class="doc-toc" aria-label="文章目录">
    <ul class="doc-toc-list">
      <li v-for="item in items" :key="item.id">
        <button
          type="button"
          class="doc-toc-item"
          :class="[`doc-toc-item--l${item.level}`, { 'is-active': item.id === activeId }]"
          :title="item.text"
          @click="emit('jump', item.id)"
        >
          {{ item.text }}
        </button>
      </li>
    </ul>
  </nav>
</template>
