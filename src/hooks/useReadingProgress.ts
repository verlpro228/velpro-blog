import { nextTick, ref, type Ref } from 'vue'
import { useThrottleFn } from '@vueuse/core'

interface HeadingSnapshot {
  id: string
  offsetTop: number
}

interface UseReadingProgressOptions {
  mode?: 'container' | 'page'
  topOffset?: number
}

interface ResetOptions {
  behavior?: ScrollBehavior
}

export function useReadingProgress(
  containerRef: Ref<HTMLElement | null>,
  options: UseReadingProgressOptions = {},
) {
  const progress = ref(0)
  const activeHeadingId = ref('')
  const headings = ref<HeadingSnapshot[]>([])
  const mode = options.mode ?? 'container'
  const topOffset = options.topOffset ?? 72

  const syncHeadings = async () => {
    await nextTick()

    const container = containerRef.value

    if (!container) {
      headings.value = []
      activeHeadingId.value = ''
      return
    }

    const headingNodes = Array.from(container.querySelectorAll<HTMLElement>('h2, h3, h4'))
    const containerTop = mode === 'page' ? window.scrollY + container.getBoundingClientRect().top : 0

    headings.value = headingNodes.map((node) => ({
      id: node.id,
      offsetTop: mode === 'page' ? window.scrollY + node.getBoundingClientRect().top : node.offsetTop,
    }))

    if (mode === 'page' && headings.value.length) {
      headings.value = headings.value.map((heading) => ({
        ...heading,
        offsetTop: Math.max(containerTop, heading.offsetTop),
      }))
    }

    activeHeadingId.value = headings.value[0]?.id ?? ''
  }

  const update = useThrottleFn(() => {
    const container = containerRef.value

    if (!container) {
      return
    }

    if (mode === 'page') {
      const containerTop = window.scrollY + container.getBoundingClientRect().top
      const containerHeight = container.offsetHeight
      const viewportHeight = window.innerHeight
      const scrollStart = Math.max(0, containerTop - topOffset)
      const scrollEnd = Math.max(scrollStart + 1, containerTop + containerHeight - viewportHeight + topOffset)
      const currentScroll = window.scrollY
      const ratio = (currentScroll - scrollStart) / (scrollEnd - scrollStart)

      progress.value = Math.min(100, Math.max(0, ratio * 100))

      const currentHeading = [...headings.value]
        .reverse()
        .find((heading) => currentScroll + topOffset + 24 >= heading.offsetTop)

      activeHeadingId.value = currentHeading?.id ?? headings.value[0]?.id ?? ''
      return
    }

    const { scrollTop, scrollHeight, clientHeight } = container
    const total = scrollHeight - clientHeight
    progress.value = total > 0 ? (scrollTop / total) * 100 : 0

    const currentHeading = [...headings.value]
      .reverse()
      .find((heading) => scrollTop + topOffset >= heading.offsetTop)

    activeHeadingId.value = currentHeading?.id ?? headings.value[0]?.id ?? ''
  }, 32)

  const scrollToHeading = (id: string) => {
    const container = containerRef.value

    if (!container) {
      return
    }

    const target = container.querySelector<HTMLElement>(`#${CSS.escape(id)}`)

    if (!target) {
      return
    }

    if (mode === 'page') {
      const top = window.scrollY + target.getBoundingClientRect().top - topOffset
      window.scrollTo({
        top: Math.max(0, top),
        behavior: 'smooth',
      })
      return
    }

    container.scrollTo({
      top: Math.max(0, target.offsetTop - 24),
      behavior: 'smooth',
    })
  }

  const reset = (resetOptions: ResetOptions = {}) => {
    const container = containerRef.value

    if (!container) {
      progress.value = 0
      activeHeadingId.value = headings.value[0]?.id ?? ''
      return
    }

    if (mode === 'page') {
      const top = window.scrollY + container.getBoundingClientRect().top - topOffset
      window.scrollTo({
        top: Math.max(0, top),
        behavior: resetOptions.behavior ?? 'auto',
      })
    } else {
      container.scrollTop = 0
    }

    progress.value = 0
    activeHeadingId.value = headings.value[0]?.id ?? ''
  }

  return {
    progress,
    activeHeadingId,
    syncHeadings,
    update,
    reset,
    scrollToHeading,
  }
}
