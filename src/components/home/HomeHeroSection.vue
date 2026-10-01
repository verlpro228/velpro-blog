<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useCountUp } from "@/hooks/useCountUp";
import { useDocsStore } from "@/store/modules/docs";
import { useProjectsStore } from "@/store/modules/projects";

const heroTitle = "阅读 · 检索 · 对话";
const heroChars = Array.from(heroTitle);

const docsStore = useDocsStore();
const projectsStore = useProjectsStore();

// 首页实时统计：公开接口 + store 缓存（30s/60s），已访问过的用户零额外请求
const siteStatsReady = computed(() => docsStore.initialized && !docsStore.loading);

const totalViews = computed(() =>
  docsStore.docs.reduce((sum, doc) => sum + (doc.views ?? 0), 0),
);

// 统计卡数据源：就绪判定与取值逻辑与改动前完全一致，
// 只是把「目标数字」和「展示文案」拆开，中间留出滚动动画的位置
const metricSources = computed(() => [
  {
    label: "已发布文档",
    suffix: " 篇",
    value: siteStatsReady.value ? docsStore.docs.length : null,
  },
  {
    label: "在线项目",
    suffix: " 个",
    value: siteStatsReady.value && projectsStore.initialized
      ? projectsStore.projects.length
      : null,
  },
  {
    label: "累计阅读",
    suffix: "",
    value: siteStatsReady.value ? totalViews.value : null,
  },
]);

// 三张卡全部就绪后才把目标值交给动画（任一未就绪返回 null → 展示占位符）
const metricTargets = computed<number[] | null>(() => {
  const values = metricSources.value.map((metric) => metric.value);

  return values.some((value) => value === null) ? null : (values as number[]);
});

// 数字滚动：0 → 目标值，1.2s easeOutCubic；减弱动态时直接显示终值
const { display: displayNumbers } = useCountUp(metricTargets);

const heroMetrics = computed(() =>
  metricSources.value.map((metric, index) => {
    const current = displayNumbers.value[index];

    return {
      label: metric.label,
      value:
        metric.value === null || current === undefined
          ? "—"
          : `${current.toLocaleString()}${metric.suffix}`,
    };
  }),
);

const capabilityTags = [
  "Vue 3",
  "TypeScript",
  "FastAPI",
  "MySQL",
  "GSAP 动效",
  "AI 流式对话",
];

onMounted(() => {
  // 拉取公开数据供 hero 统计卡展示（有缓存与 TTL，重复访问零请求）
  if (!docsStore.initialized) {
    void docsStore.fetchDocs();
  }

  if (!projectsStore.initialized) {
    void projectsStore.fetchProjects();
  }
});
</script>

<template>
  <section class="relative px-4 pb-12 pt-6 sm:px-6 sm:pb-16 sm:pt-10 md:pb-24">
    <div
      class="home-orb pointer-events-none absolute left-[8%] top-10 h-32 w-32 rounded-full bg-cyan-400/15 blur-3xl sm:top-12 sm:h-52 sm:w-52"
    />
    <div
      class="home-orb pointer-events-none absolute right-[10%] top-20 h-44 w-44 rounded-full bg-blue-500/15 blur-3xl sm:top-24 sm:h-72 sm:w-72"
    />

    <div
      class="hero-stage mx-auto grid max-w-7xl items-center gap-10 sm:gap-14 lg:grid-cols-[1.12fr_0.88fr]"
    >
      <div>
        <p
          class="app-overline hero-copy mb-3 text-[11px] font-semibold uppercase tracking-[0.24em] sm:mb-4 sm:text-xs sm:tracking-[0.38em]"
        >
          前端开发工程师 · 全栈自研技术博客
        </p>
        <h1
          class="app-heading mb-5 max-w-4xl text-4xl font-semibold leading-tight tracking-tight sm:mb-6 sm:text-5xl md:text-7xl"
        >
          <span
            v-for="(char, index) in heroChars"
            :key="`${char}-${index}`"
            class="hero-char inline-block"
          >
            {{ char === " " ? "\u00A0" : char }}
          </span>
        </h1>
        <p
          class="app-copy hero-copy max-w-2xl text-base leading-7 sm:text-lg sm:leading-8"
        >
          用 Vue 3 + FastAPI 从零搭建的个人技术站：全文检索与目录导航、阅读进度跟随，支持评论互动与
          AI 助手流式答疑，每篇文章都可一键导出 MD / PDF / JSON。
        </p>

        <div class="hero-copy mt-6 flex flex-wrap gap-2 sm:mt-8 sm:gap-3">
          <span
            v-for="tag in capabilityTags"
            :key="tag"
            class="app-chip hero-chip inline-flex rounded-full px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm"
          >
            {{ tag }}
          </span>
        </div>

        <div
          class="hero-copy mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:flex-wrap sm:gap-4"
        >
          <RouterLink
            class="app-button-primary w-full justify-center px-6 py-3 text-sm sm:w-auto"
            to="/knowledge"
          >
            进入知识库
          </RouterLink>
          <RouterLink
            class="app-button-secondary w-full justify-center px-6 py-3 text-sm sm:w-auto"
            to="/projects"
          >
            浏览项目页
          </RouterLink>
        </div>

        <div
          class="hero-copy mt-10 grid gap-4 sm:mt-12 sm:grid-cols-2 md:grid-cols-3"
        >
          <div
            v-for="metric in heroMetrics"
            :key="metric.label"
            class="app-card hero-metric rounded-[1.5rem] px-5 py-4"
          >
            <p class="app-caption text-sm">{{ metric.label }}</p>
            <p class="app-heading mt-3 text-3xl font-semibold">
              {{ metric.value }}
            </p>
          </div>
        </div>
      </div>

      <div
        class="app-panel hero-panel relative rounded-[1.75rem] p-5 backdrop-blur sm:rounded-[2rem] sm:p-8"
      >
        <div class="mb-6 flex items-center gap-3">
          <div class="h-3 w-3 rounded-full bg-rose-400" />
          <div class="h-3 w-3 rounded-full bg-amber-400" />
          <div class="h-3 w-3 rounded-full bg-emerald-400" />
        </div>

        <div class="space-y-5">
          <div
            class="floating-panel overflow-hidden rounded-[1.75rem] border border-cyan-400/20 bg-cyan-400/10"
          >
            <KnowledgeGalaxy class="hero-galaxy" />
          </div>

          <div class="grid gap-4 sm:grid-cols-2">
            <div class="app-card-strong floating-panel rounded-[1.5rem] p-5">
              <p class="app-caption text-sm">交互动效</p>
              <p class="app-heading mt-2 text-2xl font-semibold">
                GSAP + ScrollTrigger
              </p>
            </div>
            <div class="app-card-strong floating-panel rounded-[1.5rem] p-5">
              <p class="app-caption text-sm">内容引擎</p>
              <p class="app-heading mt-2 text-2xl font-semibold">
                Markdown CMS
              </p>
            </div>
          </div>

          <div
            class="app-card-strong floating-panel rounded-[1.5rem] p-5 sm:mb-10"
          >
            <p class="app-caption text-sm">AI 助手</p>
            <p class="app-copy mt-3 text-base leading-7">
              内置大模型助手，通过 SSE
              流式返回，支持多轮追问与随时终止；接口密钥仅保存在服务端，不会暴露给浏览器。
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* 星图容器：保留原 Vanta 面板的深蓝渐变作为降级底，星图画布叠加其上 */
.hero-galaxy {
  position: relative;
  aspect-ratio: 4 / 3;
  width: 100%;
  overflow: hidden;
  border-radius: 1.5rem;
  background:
    radial-gradient(
      ellipse at 24% 22%,
      rgba(56, 130, 190, 0.22),
      transparent 42%
    ),
    radial-gradient(
      ellipse at 78% 80%,
      rgba(14, 116, 144, 0.16),
      transparent 46%
    ),
    linear-gradient(160deg, #071226 0%, #050b1a 55%, #030814 100%);
}
</style>
