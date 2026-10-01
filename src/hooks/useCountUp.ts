import { onBeforeUnmount, ref, watch, type Ref } from 'vue'

interface UseCountUpOptions {
  /** 动画时长（毫秒） */
  duration?: number
  /** 是否只播放一次（默认 true）。播放过后目标值再变化时直接落位，不重复动画 */
  once?: boolean
}

/**
 * 数值滚动动画：requestAnimationFrame + easeOutCubic。
 *
 * - 目标值从 null 变为数组时触发一次动画（用于「数据到达后再滚动」的场景）
 * - 目标值回到 null（数据重新加载中）时不改变显示值，由调用方决定占位文案
 * - 系统开启「减弱动态效果」时跳过动画，直接显示终值
 */
export function useCountUp(targets: Ref<number[] | null>, options: UseCountUpOptions = {}) {
  const { duration = 1200, once = true } = options

  const display = ref<number[]>([])
  const played = ref(false)
  let frame = 0

  const stop = () => {
    if (frame) {
      cancelAnimationFrame(frame)
      frame = 0
    }
  }

  const prefersReducedMotion = () =>
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  watch(
    targets,
    (next) => {
      // 数据未就绪：保持当前显示值，不动画
      if (!next) {
        return
      }

      stop()

      // 已经播放过（once）：后续数据变化直接落位，避免重复滚动
      if (once && played.value) {
        display.value = [...next]
        return
      }

      played.value = true

      // 降级：不做动画，直接显示终值
      if (prefersReducedMotion()) {
        display.value = [...next]
        return
      }

      const start = performance.now()
      display.value = next.map(() => 0)

      const tick = (now: number) => {
        // 必须夹到 [0,1]：RAF 回调的 now 是「帧起始时间」，可能略早于注册前的
        // performance.now()，相减会得到负 progress，被 easeOutCubic 放大成负数
        const progress = Math.max(0, Math.min(1, (now - start) / duration))
        const eased = 1 - (1 - progress) ** 3 // easeOutCubic

        display.value = next.map((target) => Math.round(target * eased))

        frame = progress < 1 ? requestAnimationFrame(tick) : 0
      }

      frame = requestAnimationFrame(tick)
    },
    { immediate: true },
  )

  onBeforeUnmount(stop)

  return { display, stop }
}
