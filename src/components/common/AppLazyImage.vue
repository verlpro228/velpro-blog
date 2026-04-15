<script setup lang="ts">
import { ref, watch } from 'vue'
import { useIntersectionObserver } from '@vueuse/core'

interface Props {
  src: string
  alt: string
  eager?: boolean
  imgClass?: string
  rootMargin?: string
  sizes?: string
  wrapperClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  eager: false,
  imgClass: '',
  rootMargin: '240px 0px',
  sizes: '100vw',
  wrapperClass: '',
})

const emit = defineEmits<{
  loaded: []
}>()

const wrapperRef = ref<HTMLElement | null>(null)
const shouldLoad = ref(props.eager)
const loaded = ref(false)
const failed = ref(false)

watch(
  () => props.src,
  () => {
    loaded.value = false
    failed.value = false
    shouldLoad.value = props.eager
  },
  { immediate: true },
)

useIntersectionObserver(
  wrapperRef,
  ([entry]) => {
    if (props.eager || shouldLoad.value) {
      return
    }

    if (entry?.isIntersecting) {
      shouldLoad.value = true
    }
  },
  {
    rootMargin: props.rootMargin,
  },
)

const handleLoad = () => {
  loaded.value = true
  emit('loaded')
}

const handleError = () => {
  failed.value = true
}
</script>

<template>
  <div ref="wrapperRef" class="lazy-media relative overflow-hidden" :class="wrapperClass">
    <div class="lazy-media__placeholder absolute inset-0" :class="{ 'is-hidden': loaded }">
      <div v-if="failed" class="lazy-media__fallback">图片加载失败</div>
    </div>

    <img
      v-if="shouldLoad && src"
      :src="src"
      :alt="alt"
      :sizes="sizes"
      :loading="eager ? 'eager' : 'lazy'"
      :fetchpriority="eager ? 'high' : 'auto'"
      decoding="async"
      class="lazy-media__image h-full w-full"
      :class="[imgClass, { 'is-loaded': loaded }]"
      @error="handleError"
      @load="handleLoad"
    >
  </div>
</template>

<style scoped>
.lazy-media {
  background:
    linear-gradient(135deg, rgba(15, 23, 42, 0.92), rgba(8, 47, 73, 0.82)),
    linear-gradient(90deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.1));
}

.lazy-media__placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background:
    linear-gradient(120deg, rgba(255, 255, 255, 0.04), rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.04));
  background-size: 200% 100%;
  animation: shimmer 1.6s linear infinite;
  transition: opacity 0.35s ease;
}

.lazy-media__placeholder.is-hidden {
  opacity: 0;
  pointer-events: none;
}

.lazy-media__image {
  opacity: 0;
  transform: scale(1.02);
  transition:
    opacity 0.45s ease,
    transform 0.7s ease;
}

.lazy-media__image.is-loaded {
  opacity: 1;
  transform: scale(1);
}

.lazy-media__fallback {
  z-index: 1;
  color: rgba(226, 232, 240, 0.86);
  font-size: 0.85rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }

  100% {
    background-position: -200% 0;
  }
}
</style>
