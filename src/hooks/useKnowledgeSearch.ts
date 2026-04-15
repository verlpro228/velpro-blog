import { computed, ref, watch, type Ref } from 'vue'
import Fuse from 'fuse.js'
import { useDebounceFn } from '@vueuse/core'
import type { KnowledgeDoc } from '@/types/content'

export function useKnowledgeSearch(
  source: Ref<KnowledgeDoc[]>,
  initialKeyword = '',
  onKeywordChange?: (keyword: string) => void,
) {
  const keyword = ref(initialKeyword)
  const debouncedKeyword = ref(initialKeyword)

  const applyKeyword = useDebounceFn((value: string) => {
    const normalized = value.trim()
    debouncedKeyword.value = normalized
    onKeywordChange?.(normalized)
  }, 220)

  watch(
    keyword,
    (value) => {
      applyKeyword(value)
    },
    { immediate: true },
  )

  const engine = computed(
    () =>
      new Fuse(source.value, {
        keys: ['title', 'tags'],
        threshold: 0.3,
        ignoreLocation: true,
      }),
  )

  const results = computed(() => {
    if (!debouncedKeyword.value) {
      return source.value
    }

    return engine.value.search(debouncedKeyword.value).map((item) => item.item)
  })

  return {
    keyword,
    debouncedKeyword,
    results,
    isSearching: computed(() => Boolean(debouncedKeyword.value)),
  }
}
