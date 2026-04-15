<script setup lang="ts">
withDefaults(
  defineProps<{
    title?: string
    description: string
  }>(),
  {
    title: '暂无内容',
  },
)
</script>

<template>
  <div class="app-empty-state flex flex-col items-center justify-center rounded-[1.5rem] px-6 py-12 text-center">
    <div class="app-empty-state__icon mb-4 flex h-14 w-14 items-center justify-center rounded-full">
      <span class="text-xl">+</span>
    </div>
    <p class="app-heading text-base font-semibold">{{ title }}</p>
    <p class="app-caption mt-2 max-w-sm text-sm leading-6">{{ description }}</p>
  </div>
</template>

<style scoped>
.app-empty-state {
  border: 1px dashed var(--color-border);
  background: var(--color-surface-soft);
}

.app-empty-state__icon {
  background: var(--color-chip-bg);
  color: var(--color-primary);
}
</style>
