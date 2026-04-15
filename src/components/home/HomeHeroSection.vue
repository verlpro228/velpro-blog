<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { usePreferredReducedMotion } from '@vueuse/core'

interface VantaEffect {
  destroy: () => void
  resize?: () => void
}

const heroTitle = '阅读 · 创作 · 管理'
const heroChars = Array.from(heroTitle)

const heroMetrics = [
  { label: '核心模块', value: '10+' },
  { label: '动效场景', value: '5' },
  { label: '内容闭环', value: 'CMS' },
]

const capabilityTags = ['Vue 3', 'TypeScript', 'GSAP', 'Markdown', 'Element Plus', 'Vanta HALO']

const vantaContainerRef = ref<HTMLElement | null>(null)
const preferredReducedMotion = usePreferredReducedMotion()
let vantaEffect: VantaEffect | null = null
let idleHandle: number | null = null
let timeoutHandle: ReturnType<typeof globalThis.setTimeout> | null = null
let vantaFactoryPromise: Promise<(options: Record<string, unknown>) => VantaEffect> | null = null
let isInitializing = false

const VANTA_MIN_WIDTH = 768

const canEnableVanta = () =>
  typeof window !== 'undefined' &&
  preferredReducedMotion.value !== 'reduce' &&
  window.innerWidth >= VANTA_MIN_WIDTH

const loadVantaFactory = async () => {
  if (!vantaFactoryPromise) {
    vantaFactoryPromise = Promise.all([import('three'), import('vanta/dist/vanta.halo.min.js')]).then(
      ([threeModule, haloModule]) => {
        const haloExport = haloModule.default as unknown
        const nestedHaloExport =
          typeof haloExport === 'object' && haloExport !== null
            ? (haloExport as { default?: unknown }).default
            : undefined
        const haloFactory =
          typeof haloExport === 'function'
            ? (haloExport as (options: Record<string, unknown>) => VantaEffect)
            : typeof nestedHaloExport === 'function'
              ? (nestedHaloExport as (options: Record<string, unknown>) => VantaEffect)
              : null

        if (!haloFactory) {
          throw new Error('Vanta HALO factory is unavailable')
        }

        return (options: Record<string, unknown>) =>
          haloFactory({
            THREE: threeModule,
            ...options,
          })
      },
    )
  }

  return vantaFactoryPromise
}

const destroyVanta = () => {
  vantaEffect?.destroy()
  vantaEffect = null
}

const initVanta = async () => {
  if (!vantaContainerRef.value || !canEnableVanta() || isInitializing) {
    return
  }

  isInitializing = true

  try {
    const createHalo = await loadVantaFactory()

    destroyVanta()

    vantaEffect = createHalo({
      el: vantaContainerRef.value,
      mouseControls: true,
      touchControls: true,
      gyroControls: true,
      minHeight: 100,
      minWidth: 100,
      baseColor: 0x163654,
      backgroundColor: 0x272756,
    })

    vantaEffect.resize?.()
  } catch (error) {
    console.warn('Vanta HALO 初始化失败：', error)
  } finally {
    isInitializing = false
  }
}

const scheduleVanta = () => {
  const activate = () => {
    void initVanta()
  }

  if (window.requestIdleCallback) {
    idleHandle = window.requestIdleCallback(activate, { timeout: 1200 })
    return
  }

  timeoutHandle = globalThis.setTimeout(activate, 420)
}

const handleViewportChange = () => {
  if (!canEnableVanta()) {
    destroyVanta()
    return
  }

  if (vantaEffect) {
    vantaEffect.resize?.()
    return
  }

  void initVanta()
}

onMounted(async () => {
  await nextTick()
  scheduleVanta()
  window.addEventListener('resize', handleViewportChange, { passive: true })
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleViewportChange)

  if (idleHandle !== null && window.cancelIdleCallback) {
    window.cancelIdleCallback(idleHandle)
  }

  if (timeoutHandle !== null) {
    globalThis.clearTimeout(timeoutHandle)
  }

  destroyVanta()
})
</script>

<template>
  <section class="relative px-4 pb-12 pt-6 sm:px-6 sm:pb-16 sm:pt-10 md:pb-24">
    <div
      class="home-orb pointer-events-none absolute left-[8%] top-10 h-32 w-32 rounded-full bg-cyan-400/15 blur-3xl sm:top-12 sm:h-52 sm:w-52" />
    <div
      class="home-orb pointer-events-none absolute right-[10%] top-20 h-44 w-44 rounded-full bg-blue-500/15 blur-3xl sm:top-24 sm:h-72 sm:w-72" />

    <div class="mx-auto grid max-w-7xl items-center gap-10 sm:gap-14 lg:grid-cols-[1.12fr_0.88fr]">
      <div>
        <p class="app-overline hero-copy mb-3 text-[11px] font-semibold uppercase tracking-[0.24em] sm:mb-4 sm:text-xs sm:tracking-[0.38em]">
          面向前端开发者日常阅读的知识博客
        </p>
        <h1 class="app-heading mb-5 max-w-4xl text-4xl font-semibold leading-tight tracking-tight sm:mb-6 sm:text-5xl md:text-7xl">
          <span v-for="(char, index) in heroChars" :key="`${char}-${index}`" class="hero-char inline-block">
            {{ char === ' ' ? '\u00A0' : char }}
          </span>
        </h1>
        <p class="app-copy hero-copy max-w-2xl text-base leading-7 sm:text-lg sm:leading-8">
          这里整理前端开发中的实践、记录与工具经验，让阅读、检索、沉淀和回看内容都更顺手。
        </p>

        <div class="hero-copy mt-6 flex flex-wrap gap-2 sm:mt-8 sm:gap-3">
          <span v-for="tag in capabilityTags" :key="tag"
            class="app-chip hero-chip inline-flex rounded-full px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm">
            {{ tag }}
          </span>
        </div>

        <div class="hero-copy mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:flex-wrap sm:gap-4">
          <RouterLink class="app-button-primary w-full justify-center px-6 py-3 text-sm sm:w-auto" to="/knowledge">
            进入知识库
          </RouterLink>
          <RouterLink class="app-button-secondary w-full justify-center px-6 py-3 text-sm sm:w-auto" to="/projects">
            浏览项目页
          </RouterLink>
        </div>

        <div class="hero-copy mt-10 grid gap-4 sm:mt-12 sm:grid-cols-2 md:grid-cols-3">
          <div v-for="metric in heroMetrics" :key="metric.label"
            class="app-card hero-metric rounded-[1.5rem] px-5 py-4">
            <p class="app-caption text-sm">{{ metric.label }}</p>
            <p class="app-heading mt-3 text-3xl font-semibold">{{ metric.value }}</p>
          </div>
        </div>
      </div>

      <div class="app-panel hero-panel relative rounded-[1.75rem] p-5 backdrop-blur sm:rounded-[2rem] sm:p-8">
        <div class="mb-6 flex items-center gap-3">
          <div class="h-3 w-3 rounded-full bg-rose-400" />
          <div class="h-3 w-3 rounded-full bg-amber-400" />
          <div class="h-3 w-3 rounded-full bg-emerald-400" />
        </div>

        <div class="space-y-5">
          <div class="floating-panel overflow-hidden rounded-[1.75rem] border border-cyan-400/20 bg-cyan-400/10">
            <div ref="vantaContainerRef" class="hero-vanta-panel aspect-[4/3] w-full" aria-label="Velpro Blog 动态背景" />
          </div>

          <div class="grid gap-4 sm:grid-cols-2">
            <div class="app-card-strong floating-panel rounded-[1.5rem] p-5">
              <p class="app-caption text-sm">动画层</p>
              <p class="app-heading mt-2 text-2xl font-semibold">GSAP + ScrollTrigger</p>
            </div>
            <div class="app-card-strong floating-panel rounded-[1.5rem] p-5">
              <p class="app-caption text-sm">内容引擎</p>
              <p class="app-heading mt-2 text-2xl font-semibold">Markdown CMS</p>
            </div>
          </div>

          <div class="app-card-strong floating-panel rounded-[1.5rem] p-5 sm:mb-10">
            <p class="app-caption text-sm">使用体验</p>
            <p class="app-copy mt-3 text-base leading-7">
              通过清晰的导航路径、稳定的内容组织和一致的交互反馈，让阅读与内容管理在长期使用中依然轻松顺手。
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero-vanta-panel {
  position: relative;
  overflow: hidden;
  background:
    radial-gradient(circle at 20% 20%, rgba(96, 165, 250, 0.26), transparent 32%),
    radial-gradient(circle at 80% 25%, rgba(34, 211, 238, 0.22), transparent 28%),
    linear-gradient(135deg, rgba(19, 36, 76, 0.96), rgba(29, 78, 216, 0.82));
}

.hero-vanta-panel :deep(canvas) {
  display: block;
  width: 100% !important;
  height: 100% !important;
}
</style>
