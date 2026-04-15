import { ref, watch, type Ref } from 'vue'

let markdownModulePromise: Promise<typeof import('@/utils/markdown')> | null = null
let markdownStylePromise: Promise<unknown> | null = null

function loadMarkdownModule() {
  if (!markdownModulePromise) {
    markdownModulePromise = import('@/utils/markdown')
  }

  return markdownModulePromise
}

function loadMarkdownStyle() {
  if (!markdownStylePromise) {
    markdownStylePromise = import('highlight.js/styles/atom-one-dark.css')
  }

  return markdownStylePromise
}

export function useAsyncMarkdown(source?: Ref<string>) {
  const html = ref('')
  const loading = ref(false)
  const ready = ref(false)

  const render = async (content: string) => {
    loading.value = true

    try {
      const [{ renderMarkdown, injectHeadingIds }] = await Promise.all([
        loadMarkdownModule(),
        loadMarkdownStyle(),
      ])
      html.value = injectHeadingIds(renderMarkdown(content))
      ready.value = true
    } finally {
      loading.value = false
    }
  }

  const warmup = async () => {
    await Promise.all([loadMarkdownModule(), loadMarkdownStyle()])
    ready.value = true
  }

  if (source) {
    watch(
      source,
      (value) => {
        void render(value)
      },
      { immediate: true },
    )
  }

  return {
    html,
    loading,
    ready,
    render,
    warmup,
  }
}
