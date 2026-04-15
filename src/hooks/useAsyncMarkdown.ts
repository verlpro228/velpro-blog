import { ref, watch, type Ref } from 'vue'
import { injectHeadingIds, renderMarkdown } from '@/utils/markdown'

export function useAsyncMarkdown(source?: Ref<string>) {
  const html = ref('')
  const loading = ref(false)
  const ready = ref(false)

  const render = async (content: string) => {
    loading.value = true

    try {
      html.value = injectHeadingIds(renderMarkdown(content))
      ready.value = true
    } catch (error) {
      console.error('[markdown] render failed.', error)
      html.value = injectHeadingIds(renderMarkdown(content ?? ''))
      ready.value = true
    } finally {
      loading.value = false
    }
  }

  const warmup = async () => {
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
