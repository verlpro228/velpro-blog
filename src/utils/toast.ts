type ToastType = 'info' | 'success' | 'warning' | 'error'

interface ToastOptions {
  type?: ToastType
  duration?: number
}

const VIEWPORT_ID = 'velpro-toast-viewport'
const STYLE_ID = 'velpro-toast-style'

const toneMap: Record<ToastType, { border: string; background: string }> = {
  info: {
    border: 'rgba(34, 211, 238, 0.28)',
    background: 'rgba(8, 145, 178, 0.12)',
  },
  success: {
    border: 'rgba(34, 197, 94, 0.28)',
    background: 'rgba(34, 197, 94, 0.12)',
  },
  warning: {
    border: 'rgba(245, 158, 11, 0.28)',
    background: 'rgba(245, 158, 11, 0.12)',
  },
  error: {
    border: 'rgba(248, 113, 113, 0.28)',
    background: 'rgba(248, 113, 113, 0.12)',
  },
}

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
      border: 1px solid var(--toast-border);
      border-radius: 18px;
      background: color-mix(in srgb, var(--toast-bg) 72%, rgba(2, 6, 23, 0.92));
      box-shadow: 0 24px 40px rgba(2, 6, 23, 0.2);
      color: var(--color-text-strong, #fff);
      padding: 14px 16px;
      line-height: 1.6;
      opacity: 0;
      transform: translateY(-6px);
      transition: opacity 0.2s ease, transform 0.2s ease;
      pointer-events: auto;
      backdrop-filter: blur(14px);
    }

    .velpro-toast.is-visible {
      opacity: 1;
      transform: translateY(0);
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

  const type = options.type ?? 'info'
  const duration = options.duration ?? 2600
  const toast = document.createElement('div')
  const tone = toneMap[type]

  toast.className = 'velpro-toast'
  toast.textContent = message
  toast.style.setProperty('--toast-border', tone.border)
  toast.style.setProperty('--toast-bg', tone.background)

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
