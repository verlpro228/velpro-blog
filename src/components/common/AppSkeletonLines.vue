<script setup lang="ts">
withDefaults(
  defineProps<{
    rows?: number
  }>(),
  {
    rows: 4,
  },
)
</script>

<template>
  <div class="space-y-3" aria-hidden="true">
    <div
      v-for="index in rows"
      :key="index"
      class="app-skeleton-line"
      :style="{ width: index === rows ? '72%' : `${92 - (index % 3) * 10}%` }"
    />
  </div>
</template>

<style scoped>
.app-skeleton-line {
  height: 0.95rem;
  border-radius: 999px;
  background: linear-gradient(
    90deg,
    rgba(148, 163, 184, 0.14) 0%,
    rgba(148, 163, 184, 0.3) 50%,
    rgba(148, 163, 184, 0.14) 100%
  );
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.25s linear infinite;
}

@keyframes skeleton-shimmer {
  from {
    background-position: 200% 0;
  }

  to {
    background-position: -200% 0;
  }
}
</style>
