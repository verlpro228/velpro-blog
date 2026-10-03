import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import type { CSSProperties, Ref } from 'vue'

/** 拖动超过该距离才判定为拖拽，否则放行原生 click */
const DRAG_THRESHOLD_PX = 6
/** 悬浮球与视口边缘的最小间距 */
const EDGE_MARGIN_PX = 16
/** 纵向下限：导航栏高度 + 安全距离，悬浮球不进入顶部导航区（避免遮挡/白底隐形） */
const EDGE_TOP_PX = 104

interface FabDragOptions {
  /** localStorage 键：持久化 { x, y }（元素左上角的视口坐标） */
  storageKey: string
  /** 无存档时的默认停靠位：距视口 right / bottom 的距离（px） */
  defaultAnchor: { right: number; bottom: number }
}

/** 已挂载悬浮球登记表：同轨道避让用（键 = storageKey） */
const fabRegistry = new Map<string, { x: number; y: number; w: number; h: number }>()

/**
 * 悬浮球拖拽（左右轨道模式）：横向只能停靠在左侧或右侧边缘两条轨道上，
 * 纵向自由拖动并夹紧在视口内；位置记忆，拖拽与点击用 6px 阈值区分。
 */
export function useDraggableFab(options: FabDragOptions, target: Ref<HTMLElement | null>) {
  const pos = reactive({ x: 0, y: 0 })
  const placed = ref(false)
  const dragging = ref(false)
  const viewportW = ref(typeof window === 'undefined' ? 1280 : window.innerWidth)

  let size = { w: 0, h: 0 }
  let pointerId = -1
  let startMouse = { x: 0, y: 0 }
  let startPos = { x: 0, y: 0 }
  let justDragged = false
  let justDraggedTimer = 0

  /** 停靠侧：由当前轨道决定，用于下拉面板、气泡换向 */
  const side = computed<'left' | 'right'>(() =>
    pos.x + size.w / 2 <= viewportW.value / 2 ? 'left' : 'right',
  )

  const style = computed<CSSProperties>(() =>
    placed.value ? { left: `${pos.x}px`, top: `${pos.y}px`, right: 'auto' } : {},
  )

  function measure() {
    const el = target.value
    if (!el) return
    size.w = el.offsetWidth
    size.h = el.offsetHeight
  }

  function clampY(y: number) {
    const maxY = Math.max(EDGE_TOP_PX, window.innerHeight - size.h - EDGE_MARGIN_PX)
    return Math.min(Math.max(y, EDGE_TOP_PX), maxY)
  }

  /** 归轨：按停靠侧把 x 钉在左/右边缘轨道上（缺省用当前停靠侧） */
  function railX(target: 'left' | 'right' = side.value) {
    return target === 'left' ? EDGE_MARGIN_PX : Math.max(EDGE_MARGIN_PX, viewportW.value - size.w - EDGE_MARGIN_PX)
  }

  /** 同轨道避让：与另一个悬浮球纵向重叠时，把自己推到它的上/下方 */
  function resolveOverlap() {
    for (const [key, other] of fabRegistry) {
      if (key === options.storageKey) continue
      const sameRail = (pos.x < viewportW.value / 2) === (other.x < viewportW.value / 2)
      if (!sameRail) continue

      const gap = 16
      const overlaps = pos.y < other.y + other.h + gap && other.y < pos.y + size.h + gap
      if (!overlaps) continue

      pos.y = clampY(
        pos.y + size.h / 2 <= other.y + other.h / 2
          ? other.y - size.h - gap
          : other.y + other.h + gap,
      )
    }
  }

  function register() {
    fabRegistry.set(options.storageKey, { x: pos.x, y: pos.y, w: size.w, h: size.h })
  }

  function restore() {
    let saved: { x?: number; y?: number } | null = null
    try {
      saved = JSON.parse(localStorage.getItem(options.storageKey) ?? 'null')
    } catch {
      saved = null
    }

    // v-if 延迟渲染的球（如 AI 总结：依赖文章异步加载）在 mounted 时 ref 还是 null，
    // measure 得到 0 尺寸会算出"球大半在屏幕外"的位置——此时保持 CSS 默认停靠位（placed=false），
    // 等元素真正出现后由下方 watch 再补一次放置
    if (!target.value) return
    measure()

    // 旧存档可能停在屏幕中间或导航栏区域：按存档 x 归轨、y 夹进可用区间
    const rail = (saved?.x ?? window.innerWidth - options.defaultAnchor.right) + size.w / 2 <= viewportW.value / 2 ? 'left' : 'right'
    pos.x = railX(rail)
    pos.y = clampY(typeof saved?.y === 'number' ? saved.y : window.innerHeight - options.defaultAnchor.bottom - size.h)
    resolveOverlap()
    placed.value = true
    register()
  }

  // v-if 元素延迟出现（ref 由 null → 元素）时补做放置
  watch(target, (el) => {
    if (el && !placed.value) {
      restore()
    }
  }, { flush: 'post' })

  function persist() {
    try {
      localStorage.setItem(options.storageKey, JSON.stringify({ x: Math.round(pos.x), y: Math.round(pos.y) }))
    } catch {
      /* 隐私模式等场景下静默降级 */
    }
  }

  function onPointerMove(event: PointerEvent) {
    if (event.pointerId !== pointerId) return
    const dy = event.clientY - startMouse.y
    if (!dragging.value) {
      const dx = event.clientX - startMouse.x
      if (Math.hypot(dx, dy) < DRAG_THRESHOLD_PX) return
      dragging.value = true
      // 拖拽期间禁用页面文本选择，避免拖拽路径高亮一大片文字
      document.body.style.userSelect = 'none'
      // 越过阈值才捕获指针：拖拽中事件不再被 iframe 等吞掉；纯点击路径不受影响
      try {
        target.value?.setPointerCapture(pointerId)
      } catch {
        /* 指针可能已释放 */
      }
    }
    event.preventDefault()
    // 横向只允许左右两条轨道：指针落在视口哪半边，球就停靠在哪条轨道
    pos.x = railX(event.clientX < viewportW.value / 2 ? 'left' : 'right')
    pos.y = clampY(startPos.y + dy)
  }

  function onPointerUp(event: PointerEvent) {
    if (event.pointerId !== pointerId) return
    window.removeEventListener('pointermove', onPointerMove)
    window.removeEventListener('pointerup', onPointerUp)
    window.removeEventListener('pointercancel', onPointerUp)
    pointerId = -1
    if (!dragging.value) return
    dragging.value = false
    document.body.style.userSelect = ''
    window.getSelection()?.removeAllRanges()
    justDragged = true
    window.clearTimeout(justDraggedTimer)
    // 兜底复位：正常情况下由 onClickCapture 在吞掉 click 时复位
    justDraggedTimer = window.setTimeout(() => {
      justDragged = false
    }, 400)
    resolveOverlap()
    register()
    persist()
  }

  /** 绑定在拖拽把手（按钮）上 */
  function onPointerDown(event: PointerEvent) {
    if (event.pointerType === 'mouse' && event.button !== 0) return
    measure()
    viewportW.value = window.innerWidth
    pointerId = event.pointerId
    startMouse = { x: event.clientX, y: event.clientY }
    startPos = { x: pos.x, y: pos.y }
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
    window.addEventListener('pointercancel', onPointerUp)
  }

  /** 绑定在容器 @click.capture：拖拽结束时吞掉派生的 click，避免误触按钮 */
  function onClickCapture(event: MouseEvent) {
    if (!justDragged) return
    event.stopPropagation()
    event.preventDefault()
    justDragged = false
  }

  function onResize() {
    viewportW.value = window.innerWidth
    if (!placed.value) return
    measure()
    const x = railX()
    const y = clampY(pos.y)
    if (x !== pos.x || y !== pos.y) {
      pos.x = x
      pos.y = y
      resolveOverlap()
      persist()
    }
    register()
  }

  onMounted(() => {
    restore()
    window.addEventListener('resize', onResize)
  })

  onBeforeUnmount(() => {
    fabRegistry.delete(options.storageKey)
    window.removeEventListener('resize', onResize)
    window.removeEventListener('pointermove', onPointerMove)
    window.removeEventListener('pointerup', onPointerUp)
    window.removeEventListener('pointercancel', onPointerUp)
    window.clearTimeout(justDraggedTimer)
  })

  return { pos, side, dragging, style, onPointerDown, onClickCapture }
}
