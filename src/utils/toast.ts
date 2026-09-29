type ToastType = 'info' | 'success' | 'warning' | 'error'

interface ToastOptions {
  type?: ToastType
  duration?: number
}

const VIEWPORT_ID = 'velpro-toast-viewport'
// 带版本号：样式调整后 HMR 会重新执行本模块，旧版本样式标签不会阻塞新样式注入
const STYLE_ID = 'velpro-toast-style-v3'

function ensureStyle() {
  if (typeof document === 'undefined' || document.getElementById(STYLE_ID)) {
    return
  }

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = `
    #${VIEWPORT_ID} {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 120;
      display: flex;
      flex-direction: column;
      gap: 12px;
      pointer-events: none;
    }

    .velpro-toast {
      min-width: 240px;
      max-width: 360px;
      border: 1px solid rgba(226, 232, 240, 0.9);
      border-radius: 18px;
      background: rgba(255, 255, 255, 0.78);
      box-shadow: 0 18px 36px rgba(15, 23, 42, 0.14);
      color: #0f172a;
      padding: 14px 16px;
      line-height: 1.6;
      opacity: 0;
      transform: translateY(-6px);
      transition: opacity 0.2s ease, transform 0.2s ease;
      pointer-events: auto;
      backdrop-filter: blur(16px) saturate(1.5);
      -webkit-backdrop-filter: blur(16px) saturate(1.5);
    }

    .velpro-toast.is-visible {
      opacity: 1;
      transform: translateY(0);
    }

    :root.theme-dark .velpro-toast {
      border-color: rgba(148, 163, 184, 0.35);
      background: rgba(15, 23, 42, 0.86);
      color: #f1f5f9;
      box-shadow: 0 18px 36px rgba(2, 6, 23, 0.4);
    }
  `

  document.head.appendChild(style)
}

function ensureViewport() {
  if (typeof document === 'undefined') {
    return null
  }

  ensureStyle()

  let viewport = document.getElementById(VIEWPORT_ID)

  if (!viewport) {
    viewport = document.createElement('div')
    viewport.id = VIEWPORT_ID
    document.body.appendChild(viewport)
  }

  return viewport
}

export function showToast(message: string, options: ToastOptions = {}) {
  const viewport = ensureViewport()

  if (!viewport) {
    return
  }

  const duration = options.duration ?? 2600
  const toast = document.createElement('div')

  toast.className = 'velpro-toast'
  toast.textContent = message

  viewport.appendChild(toast)

  requestAnimationFrame(() => {
    toast.classList.add('is-visible')
  })

  window.setTimeout(() => {
    toast.classList.remove('is-visible')
    window.setTimeout(() => {
      toast.remove()
    }, 220)
  }, duration)
}
