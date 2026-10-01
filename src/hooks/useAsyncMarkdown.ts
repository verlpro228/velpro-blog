import { ref, watch, type Ref } from 'vue'
import { injectHeadingIds, renderMarkdown, type RenderOptions } from '@/utils/markdown'

export function useAsyncMarkdown(source?: Ref<string>, renderOptions?: RenderOptions) {
  const html = ref('')
  const loading = ref(false)
  const ready = ref(false)

  const render = async (content: string) => {
    loading.value = true

    try {
      html.value = injectHeadingIds(renderMarkdown(content, renderOptions))
      ready.value = true
    } catch (error) {
      console.error('[markdown] render failed.', error)
      html.value = injectHeadingIds(renderMarkdown(content ?? '', renderOptions))
      ready.value = true
    } finally {
      loading.value = false
    }
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
  }
}
