import type { Ref } from 'vue'
import { onMounted, onUnmounted } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

let registered = false

export function useGsap() {
  if (!registered) {
    gsap.registerPlugin(ScrollTrigger)
    registered = true
  }

  const createScopedAnimation = (scope: Ref<HTMLElement | null>, handler: () => void) => {
    let context: gsap.Context | null = null

    onMounted(() => {
      if (!scope.value) {
        return
      }

      context = gsap.context(handler, scope.value)
    })

    onUnmounted(() => {
      context?.revert()
    })
  }

  return {
    gsap,
    ScrollTrigger,
    createScopedAnimation,
  }
}
