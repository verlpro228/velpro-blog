import { computed, ref, watch, type Ref } from 'vue'
import Fuse from 'fuse.js'
import { useDebounceFn } from '@vueuse/core'
import type { KnowledgeDoc } from '@/types/content'
import { extractSnippet, extractSnippetFromIndices, type SnippetParts } from '@/utils/searchSnippet'

export type SearchableDoc = KnowledgeDoc & { snippet?: SnippetParts }

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
        // content 由 store 空闲时渐进预热（warmContentCache），加载一篇自动重索引
        keys: ['title', 'tags', 'content'],
        threshold: 0.3,
        ignoreLocation: true,
        includeMatches: true,
      }),
  )

  const results = computed<SearchableDoc[]>(() => {
    if (!debouncedKeyword.value) {
      return source.value
    }

    return engine.value.search(debouncedKeyword.value).map((match) => {
      const contentMatch = match.matches?.find((entry) => entry.key === 'content')
      // 优先按关键字直接定位（高亮完整的词，兼容中英文混排空格差异）；
      // 直接定位失败（Fuse 模糊命中的变体写法）时退回 Fuse 命中区间提取
      const snippet =
        extractSnippet(match.item.content ?? '', debouncedKeyword.value) ??
        (contentMatch ? extractSnippetFromIndices(contentMatch.value ?? '', contentMatch.indices) : null)

      return { ...match.item, snippet: snippet ?? undefined }
    })
  })

  return {
    keyword,
    debouncedKeyword,
    results,
    isSearching: computed(() => Boolean(debouncedKeyword.value)),
  }
}
