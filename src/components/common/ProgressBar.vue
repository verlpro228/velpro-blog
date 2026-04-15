<script setup lang="ts">
const props = defineProps<{
  percentage: number
}>()
</script>

<template>
  <div class="pointer-events-none fixed inset-x-0 top-0 z-[60] h-1 bg-[var(--color-surface-soft)]">
    <div
      class="h-full origin-left bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-600 transition-[width] duration-150"
      :style="{ width: `${Math.min(100, Math.max(0, props.percentage))}%` }"
    />
  </div>
</template>
