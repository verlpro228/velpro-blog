<script setup lang="ts">
import SectionTitle from "@/components/common/SectionTitle.vue";

const workflow = [
  {
    title: "先找到：全文检索直达目标",
    description:
      "基于 Fuse.js 的全文检索覆盖标题、标签与正文，配合输入防抖，关键词记不全也能命中想要的那一篇。",
  },
  {
    title: "再读懂：AI 助手随时答疑",
    description:
      "页面右下角的 AI 助手随叫随到，围绕当前内容流式解答，可以连续追问，不必跳出页面另开搜索。",
  },
  {
    title: "带得走：多格式一键导出",
    description:
      "每篇文档都可导出 Markdown、PDF 或 JSON，离线存档、二次编辑或迁移到其他笔记工具都很省事。",
  },
];
</script>

<template>
  <section class="scroll-reveal deferred-section px-4 py-12 sm:px-6 sm:py-16">
    <div
      class="app-panel-strong mx-auto grid max-w-7xl gap-6 rounded-[2rem] p-5 sm:gap-10 sm:p-8 lg:grid-cols-[0.9fr_1.1fr]"
    >
      <SectionTitle
        class="self-center"
        eyebrow="使用路径"
        title="搜索、提问、导出，把内容真正用起来"
        description="不管你想快速定位某一篇、深入理解一个知识点，还是把它收进自己的资料库，都能找到对应的路径。"
      />

      <div class="grid gap-4">
        <article
          v-for="(item, index) in workflow"
          :key="item.title"
          class="app-card story-card interactive-card rounded-[1.5rem] p-4 sm:p-5"
        >
          <p class="app-overline text-sm font-medium">Step {{ index + 1 }}</p>
          <h3 class="app-heading mt-3 text-xl font-semibold">
            {{ item.title }}
          </h3>
          <p class="app-copy mt-3 text-sm leading-7">{{ item.description }}</p>
        </article>
      </div>
    </div>
  </section>
</template>
