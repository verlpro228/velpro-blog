<script setup lang="ts">
import SectionTitle from "@/components/common/SectionTitle.vue";

const featureCards = [
  {
    title: "全栈自研 · 打通完整链路",
    description:
      "Vue 3 前端 → FastAPI 接口 → MySQL 持久化 → 云端部署，从页面到数据库的每一环都自己走通，不是套模板的静态博客。",
  },
  {
    title: "内容在线管理 · 改完即生效",
    description:
      "内置 Markdown 编辑器与后台 CMS，文章、项目与个人资料都能随时增删改查，无需改代码、也不必重新部署。",
  },
  {
    title: "AI 助手常驻 · 边读边问",
    description:
      "接入大模型并以 SSE 流式返回，支持多轮追问与随时终止；密钥只留在服务端，不会出现在浏览器里。",
  },
];
</script>

<template>
  <section class="deferred-section px-4 py-12 sm:px-6 sm:py-16">
    <div class="mx-auto max-w-7xl">
      <SectionTitle
        eyebrow="网站特点"
        title="这个站点本身就是一件前端作品"
        description="从页面交互到接口设计，从数据持久化到部署上线，全部独立完成。"
      />

      <div class="mt-12 grid gap-6 md:grid-cols-3">
        <article
          v-for="card in featureCards"
          :key="card.title"
          class="app-card glass-card feature-card interactive-card rounded-[1.75rem] p-5 sm:p-6"
        >
          <p class="app-overline text-sm font-medium">核心能力</p>
          <h3 class="app-heading mt-4 text-xl font-semibold sm:text-2xl">
            {{ card.title }}
          </h3>
          <p class="app-copy mt-4 text-sm leading-7 sm:text-base">
            {{ card.description }}
          </p>
        </article>
      </div>
    </div>
  </section>
</template>
