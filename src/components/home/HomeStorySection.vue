<script setup lang="ts">
import SectionTitle from '@/components/common/SectionTitle.vue'

const workflow = [
  {
    title: '首页快速进入主题',
    description:
      '通过清晰的信息层级和自然的动效节奏，帮助你更快找到感兴趣的内容入口。',
  },
  {
    title: '知识库沉淀核心内容',
    description:
      '知识库把零散笔记整理成可检索、可阅读、可导航的内容，降低重复查找成本。',
  },
  {
    title: '后台保持内容更新',
    description:
      '编辑器支持新增、预览、更新和删除，让内容维护更稳定，也更适合长期积累。',
  },
]
</script>

<template>
  <section class="scroll-reveal deferred-section px-4 py-12 sm:px-6 sm:py-16">
    <div class="app-panel-strong mx-auto grid max-w-7xl gap-6 rounded-[2rem] p-5 sm:gap-10 sm:p-8 lg:grid-cols-[0.9fr_1.1fr]">
      <SectionTitle class="self-center" eyebrow="内容流转" title="从阅读到维护形成闭环"
        description="能搜、能回顾，越用越顺手，越积越厚实。不仅提供阅读入口，也让内容能够持续更新、整理和复用。" />

      <div class="grid gap-4">
        <article v-for="(item, index) in workflow" :key="item.title"
          class="app-card story-card interactive-card rounded-[1.5rem] p-4 sm:p-5">
          <p class="app-overline text-sm font-medium">Step {{ index + 1 }}</p>
          <h3 class="app-heading mt-3 text-xl font-semibold">{{ item.title }}</h3>
          <p class="app-copy mt-3 text-sm leading-7">{{ item.description }}</p>
        </article>
      </div>
    </div>
  </section>
</template>
