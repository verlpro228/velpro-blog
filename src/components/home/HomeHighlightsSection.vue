<script setup lang="ts">
import SectionTitle from '@/components/common/SectionTitle.vue'

const featureCards = [
  {
    title: '快如闪电 · 稳如磐石',
    description:
      '页面秒开，切换无卡顿，享受丝滑浏览体验。精心打磨技术架构，只为让你少等待、多收获。',
  },
  {
    title: '内容不迷路 · 找得到也看得懂',
    description:
      '文章按主题分类，支持关键词搜索，还有“新手入门”、“面试高频”、“项目实战”等标签帮你快速定位。',
  },
  {
    title: '一站式知识管家',
    description:
      '不用切换工具、不用翻文件夹——你的知识库，就该这么顺手。',
  },
]
</script>

<template>
  <section class="deferred-section px-4 py-12 sm:px-6 sm:py-16">
    <div class="mx-auto max-w-7xl">
      <SectionTitle
        eyebrow="核心价值"
        title="这里不只是博客，更是你的知识加油站"
        description="重点不在堆功能，而在让阅读、检索和维护都保持稳定、清晰和高效。"
      />

      <div class="mt-12 grid gap-6 md:grid-cols-3">
        <article
          v-for="card in featureCards"
          :key="card.title"
          class="app-card feature-card interactive-card rounded-[1.75rem] p-5 sm:p-6"
        >
          <p class="app-overline text-sm font-medium">模块价值</p>
          <h3 class="app-heading mt-4 text-xl font-semibold sm:text-2xl">{{ card.title }}</h3>
          <p class="app-copy mt-4 text-sm leading-7 sm:text-base">{{ card.description }}</p>
        </article>
      </div>
    </div>
  </section>
</template>
