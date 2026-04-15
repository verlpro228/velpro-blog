<script setup lang="ts">
defineProps<{
  eyebrow: string
  title: string
  description: string
}>()
</script>

<template>
  <div class="max-w-3xl">
    <p class="app-overline mb-3 text-xs font-semibold uppercase tracking-[0.32em]">{{ eyebrow }}</p>
    <h2 class="app-heading text-2xl font-semibold sm:text-3xl md:text-4xl">{{ title }}</h2>
    <p class="app-copy mt-4 text-sm leading-7 sm:text-base">{{ description }}</p>
  </div>
</template>
