<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
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
    // 数据未就绪（value=null）或数字动画尚未拿到目标值（任一卡未就绪 → targets=null →
    // display 为空数组）都算 loading：否则已就绪的卡会渲染成空白，而不是波点
    const loading = metric.value === null || current === undefined;

    return {
      label: metric.label,
      // 数据未就绪时渲染三个跳跃点，避免空白横线占位
      loading,
      value: loading ? "" : `${current.toLocaleString()}${metric.suffix}`,
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

  void fetchHitokoto();
});

// ===== 一言卡片：hitokoto 免费接口（文学/诗词/哲学分类），失败静默降级为内置语录 =====
const hitokoto = ref({ text: "", from: "" });
const hitokotoLoading = ref(false);
const FALLBACK_QUOTE = { text: "把每一件简单的事做好，就是不简单。", from: "站点寄语" };

async function fetchHitokoto() {
  hitokotoLoading.value = true;

  try {
    const response = await fetch("https://v1.hitokoto.cn/?c=d&c=i&c=k&max_length=36");
    if (!response.ok) {
      throw new Error(`hitokoto ${response.status}`);
    }

    const data = await response.json();
    hitokoto.value = {
      text: data.hitokoto,
      // 作者与出处相同（如"冯骥才「冯骥才」"）时只显示一处
      from: data.from_who
        ? data.from_who === data.from
          ? data.from_who
          : `${data.from_who}「${data.from}」`
        : `「${data.from}」`,
    };
  } catch {
    // 接口不可达/超时时用内置语录兜底，卡片不缺席
    hitokoto.value = { text: FALLBACK_QUOTE.text, from: FALLBACK_QUOTE.from };
  } finally {
    hitokotoLoading.value = false;
  }
}
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

        <!-- 一言卡片：hitokoto 接口 + 玻璃质感，点击刷新换一句 -->
        <figure class="hero-quote glass-card mt-8 max-w-xl rounded-[1.5rem] px-5 py-4 sm:mt-10">
          <div class="flex items-start gap-3">
            <svg
              class="hero-quote-mark h-5 w-5 shrink-0"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M9.5 8C7 8 5 10 5 12.5S7 17 9.5 17c.3 0 .7 0 1-.1-.6 1.3-1.9 2.3-3.5 2.6v2c3.9-.4 7-3.7 7-7.6V12C14 9.8 12 8 9.5 8Zm9 0C16 8 14 10 14 12.5S16 17 18.5 17c.3 0 .7 0 1-.1-.6 1.3-1.9 2.3-3.5 2.6v2c3.9-.4 7-3.7 7-7.6V12C23 9.8 21 8 18.5 8Z" />
            </svg>

            <Transition name="quote-fade" mode="out-in">
              <blockquote
                :key="hitokoto.text"
                class="min-w-0 flex-1"
              >
                <p class="hero-quote-text m-0 text-sm font-medium leading-6 sm:text-base sm:leading-7">
                  {{ hitokoto.text || "…" }}
                </p>
                <figcaption class="hero-quote-from mt-2 text-xs">
                  {{ hitokoto.from }}
                </figcaption>
              </blockquote>
            </Transition>

            <button
              type="button"
              class="hero-quote-refresh mt-0.5 shrink-0 rounded-full p-1.5 transition hover:rotate-90"
              :disabled="hitokotoLoading"
              title="换一句"
              aria-label="换一句"
              @click="fetchHitokoto"
            >
              <svg
                class="h-3.5 w-3.5"
                :class="{ 'animate-spin': hitokotoLoading }"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <path d="M21 12a9 9 0 1 1-2.64-6.36" />
                <polyline points="21 3 21 9 15 9" />
              </svg>
            </button>
          </div>
        </figure>

        <div
          class="hero-copy mt-8 grid gap-4 sm:mt-10 sm:grid-cols-2 md:grid-cols-3"
        >
          <div
            v-for="metric in heroMetrics"
            :key="metric.label"
            class="app-card hero-metric rounded-[1.5rem] px-5 py-4"
          >
            <p class="app-caption text-sm">{{ metric.label }}</p>
            <p class="app-heading mt-3 text-3xl font-semibold">
              <span
                v-if="metric.loading"
                class="stat-loading-dots"
                role="status"
                aria-label="数据加载中"
              >
                <i /><i /><i />
              </span>
              <template v-else>{{ metric.value }}</template>
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
/* hero 主/次按钮：液态玻璃化，与统计卡统一 */
.hero-copy .app-button-primary {
  border: 1px solid rgba(255, 255, 255, 0.45);
  background: linear-gradient(135deg, rgba(14, 165, 190, 0.8), rgba(8, 116, 145, 0.68));
  backdrop-filter: blur(16px) saturate(160%);
  -webkit-backdrop-filter: blur(16px) saturate(160%);
  box-shadow:
    0 12px 28px rgba(8, 116, 145, 0.28),
    inset 0 1px 0 rgba(255, 255, 255, 0.35);
}

.hero-copy .app-button-secondary {
  border: 1px solid rgba(255, 255, 255, 0.6);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.62), rgba(255, 255, 255, 0.36));
  backdrop-filter: blur(16px) saturate(150%);
  -webkit-backdrop-filter: blur(16px) saturate(150%);
  box-shadow:
    0 12px 28px rgba(15, 42, 80, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
}

:root.theme-dark .hero-copy .app-button-primary {
  border-color: rgba(148, 197, 255, 0.22);
  background: linear-gradient(135deg, rgba(14, 165, 190, 0.5), rgba(8, 116, 145, 0.4));
  box-shadow:
    0 12px 28px rgba(2, 6, 23, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.16);
  /* 深色下玻璃底变深，文字改白色（原 --color-primary-contrast 为深青，配浅色实底） */
  color: #ffffff;
}

:root.theme-dark .hero-copy .app-button-secondary {
  border-color: rgba(148, 197, 255, 0.14);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.04));
  box-shadow:
    0 12px 28px rgba(2, 6, 23, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.08);
}

/* 一言卡片：玻璃卡上的文字排版与刷新交互 */
.hero-quote {
  transition:
    transform 0.3s ease,
    border-color 0.3s ease,
    box-shadow 0.3s ease;
}

.hero-quote:hover {
  transform: translateY(-6px) scale(1.02);
  border-color: rgba(255, 255, 255, 0.75);
  box-shadow:
    0 22px 48px rgba(15, 42, 80, 0.18),
    0 8px 20px rgba(15, 42, 80, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.85);
}

.hero-quote:hover .hero-quote-mark {
  opacity: 1;
  transform: scale(1.08);
}

.hero-quote-mark {
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
}

.hero-quote-text {
  color: var(--color-text-strong);
}

.hero-quote-from {
  color: var(--color-text-subtle);
}

.hero-quote-mark {
  color: var(--color-primary);
  opacity: 0.7;
}

.hero-quote-refresh {
  color: var(--color-text-subtle);
}

.hero-quote-refresh:hover {
  color: var(--color-primary);
}

.hero-quote-refresh:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

/* 技术标签：hover 轻浮 + 主色描边反馈 */
.hero-chip {
  transition:
    transform 0.25s ease,
    border-color 0.25s ease,
    background-color 0.25s ease,
    color 0.25s ease;
}

.hero-chip:hover {
  transform: translateY(-2px);
  border-color: color-mix(in srgb, var(--color-primary) 45%, transparent);
  color: var(--color-primary);
}

/* 统计卡：hover 上浮 + 数字点染主色，与玻璃卡 hover 语言一致 */
.hero-metric {
  transition:
    transform 0.3s ease,
    border-color 0.3s ease,
    box-shadow 0.3s ease;
}

.hero-metric:hover {
  transform: translateY(-6px) scale(1.02);
  border-color: rgba(255, 255, 255, 0.75);
  box-shadow:
    0 22px 48px rgba(15, 42, 80, 0.18),
    0 8px 20px rgba(15, 42, 80, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.85);
}

.hero-metric .app-heading {
  transition: color 0.3s ease;
}

.hero-metric:hover .app-heading {
  color: var(--color-primary);
}

.quote-fade-enter-active,
.quote-fade-leave-active {
  transition:
    opacity 0.22s ease,
    transform 0.22s ease;
}

.quote-fade-enter-from {
  opacity: 0;
  transform: translateY(6px);
}

.quote-fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

/* 统计卡：液态玻璃——半透明渐变底 + 背景模糊 + 内高光，压住 app-card 的实底样式 */
.hero-metric {
  border: 1px solid rgba(255, 255, 255, 0.6);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.62), rgba(255, 255, 255, 0.36));
  backdrop-filter: blur(16px) saturate(150%);
  -webkit-backdrop-filter: blur(16px) saturate(150%);
  box-shadow:
    0 14px 32px rgba(15, 42, 80, 0.12),
    0 4px 12px rgba(15, 42, 80, 0.07),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
}

:root.theme-dark .hero-metric {
  border-color: rgba(148, 197, 255, 0.14);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.04));
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08);
}

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

/* 统计卡加载态：三个跳跃点（波点），数据就绪后切换为滚动数字 */
.stat-loading-dots {
  display: inline-flex;
  align-items: baseline;
  gap: 7px;
  height: 1.1em;
}

.stat-loading-dots i {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: var(--color-primary);
  animation: stat-dot-bounce 1.1s ease-in-out infinite;
}

.stat-loading-dots i:nth-child(2) {
  animation-delay: 0.16s;
}

.stat-loading-dots i:nth-child(3) {
  animation-delay: 0.32s;
}

@keyframes stat-dot-bounce {
  0%,
  100% {
    transform: translateY(0);
    opacity: 0.4;
  }

  50% {
    transform: translateY(-9px);
    opacity: 1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .stat-loading-dots i {
    animation: none;
    opacity: 0.55;
  }
}
</style>
