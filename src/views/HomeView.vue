<script setup lang="ts">
import { defineAsyncComponent, nextTick, onMounted, onUnmounted, ref } from 'vue'
import { usePreferredReducedMotion, useWindowSize } from '@vueuse/core'
import HomeHeroSection from '@/components/home/HomeHeroSection.vue'
import { useGsap } from '@/hooks/useGsap'
import { useScrollAnimation } from '@/hooks/useScrollAnimation'

const HomeHighlightsSection = defineAsyncComponent(() => import('@/components/home/HomeHighlightsSection.vue'))
const HomeStorySection = defineAsyncComponent(() => import('@/components/home/HomeStorySection.vue'))

const pageRef = ref<HTMLElement | null>(null)
const showDeferredSections = ref(false)
const preferredReducedMotion = usePreferredReducedMotion()
const { width } = useWindowSize()
const { gsap, ScrollTrigger } = useGsap()
const { fadeInUp, staggerReveal, createParallax } = useScrollAnimation()

const contexts: Array<ReturnType<typeof gsap.context>> = []
let idleHandle: number | null = null
let timeoutHandle: ReturnType<typeof setTimeout> | null = null

const runHeroAnimations = () => {
  if (!pageRef.value || preferredReducedMotion.value === 'reduce') {
    return
  }

  const context = gsap.context(() => {
    const timeline = gsap.timeline({
      defaults: {
        ease: 'power3.out',
      },
    })

    timeline
      .from('.hero-char', {
        y: 90,
        opacity: 0,
        duration: 1,
        stagger: 0.045,
        ease: 'power4.out',
      })
      .from(
        '.hero-copy',
        {
          y: 28,
          opacity: 0,
          duration: 0.75,
          stagger: 0.08,
        },
        '-=0.65',
      )
      .from(
        '.hero-chip, .hero-metric',
        {
          y: 24,
          opacity: 0,
          duration: 0.55,
          stagger: 0.06,
          // 清除内联 transform，避免盖住卡片自身的 CSS :hover 位移
          clearProps: 'transform',
        },
        '-=0.4',
      )
      .from(
        '.hero-panel',
        {
          x: 48,
          opacity: 0,
          duration: 0.85,
        },
        '-=0.75',
      )
      .from(
        '.floating-panel',
        {
          y: 28,
          opacity: 0,
          duration: 0.6,
          stagger: 0.1,
        },
        '-=0.4',
      )

    if (width.value >= 1024) {
      gsap.utils.toArray<HTMLElement>('.home-orb').forEach((item:any) => {
        createParallax(item, item.parentElement ?? item, 80)
      })

      createParallax('.hero-panel', '.hero-panel', 48)
    }
  }, pageRef.value)

  contexts.push(context)
}

const runDeferredAnimations = () => {
  if (!pageRef.value || preferredReducedMotion.value === 'reduce') {
    return
  }

  const context = gsap.context(() => {
    staggerReveal('.feature-card', '.feature-card')
    staggerReveal('.story-card', '.scroll-reveal')

    gsap.utils.toArray<HTMLElement>('.scroll-reveal').forEach((item:any) => {
      fadeInUp(item, item)
    })
  }, pageRef.value)

  contexts.push(context)
  ScrollTrigger.refresh()
}

const scheduleDeferredSections = () => {
  const activate = async () => {
    showDeferredSections.value = true
    await nextTick()
    runDeferredAnimations()
  }

  if ('requestIdleCallback' in window) {
    idleHandle = globalThis.requestIdleCallback(() => {
      void activate()
    }, { timeout: 900 })
    return
  }

  timeoutHandle = globalThis.setTimeout(() => {
    void activate()
  }, 180)
}

onMounted(() => {
  runHeroAnimations()
  scheduleDeferredSections()
})

onUnmounted(() => {
  if (idleHandle !== null && 'cancelIdleCallback' in window) {
    globalThis.cancelIdleCallback(idleHandle)
  }

  if (timeoutHandle !== null) {
    globalThis.clearTimeout(timeoutHandle)
  }

  contexts.forEach((context) => context.revert())
})
</script>

<template>
  <div ref="pageRef" class="overflow-hidden">
    <HomeHeroSection />

    <template v-if="showDeferredSections">
      <HomeHighlightsSection />
      <HomeStorySection />
    </template>
  </div>
</template>
