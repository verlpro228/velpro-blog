<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AppSkeletonLines from '@/components/common/AppSkeletonLines.vue'
import { useDocsStore } from '@/store/modules/docs'
import type { KnowledgeDoc } from '@/types/content'

const docsStore = useDocsStore()
const router = useRouter()

const yearGroups = computed(() => {
  const groups = new Map<string, KnowledgeDoc[]>()

  for (const doc of docsStore.docs) {
    const year = doc.createTime.slice(0, 4)

    if (!groups.has(year)) {
      groups.set(year, [])
    }

    groups.get(year)!.push(doc)
  }

  // docs 已按创建时间倒序，分组按年份倒序排列
  return [...groups.entries()]
    .sort((left, right) => right[0].localeCompare(left[0]))
    .map(([year, docs]) => ({ year, docs }))
})

const tagCloud = computed(() => {
  const counter = new Map<string, number>()

  for (const doc of docsStore.docs) {
    for (const tag of doc.tags) {
      counter.set(tag, (counter.get(tag) ?? 0) + 1)
    }
  }

  return [...counter.entries()]
    .sort((left, right) => right[1] - left[1])
    .map(([name, count]) => ({ name, count }))
})

function openTag(tag: string) {
  docsStore.setKeyword(tag)
  router.push('/knowledge')
}

onMounted(() => {
  if (!docsStore.docs.length) {
    void docsStore.fetchDocs()
  }
})

function openDoc(docId: string) {
  docsStore.setActiveDoc(docId)
  // 直接跳到文章独立 URL，链接可分享
  void router.push({ name: 'knowledge', params: { id: docId } })
}
</script>

<template>
  <div class="archive-page px-3 pb-16 sm:px-6 sm:pb-20">
    <div class="mx-auto max-w-screen-xl">
      <section
        class="archive-hero mb-6 rounded-[1.75rem] border border-slate-200 bg-white px-4 py-6 shadow-sm sm:px-8 sm:py-8"
      >
        <p class="app-overline text-xs uppercase tracking-[0.32em]">文档归档</p>
        <h1 class="archive-hero-title mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-[2.8rem]">
          时间线里的每一篇沉淀
        </h1>
        <p class="archive-hero-copy mt-4 text-sm leading-7 text-slate-600 sm:text-base sm:leading-8">
          按年份回看全部已发布文档，共 {{ docsStore.docs.length }} 篇。点击任意一篇即可进入知识库阅读。
        </p>
      </section>

      <section
        v-if="tagCloud.length"
        class="archive-tag-cloud mb-6 rounded-[1.75rem] border border-slate-200 bg-white px-4 py-6 shadow-sm sm:px-8 sm:py-6"
      >
        <p class="archive-cloud-title text-sm font-semibold text-slate-900">按标签浏览</p>
        <div class="mt-3 flex flex-wrap gap-2">
          <button
            v-for="tag in tagCloud"
            :key="tag.name"
            type="button"
            class="archive-cloud-tag rounded-full border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-xs text-slate-600 transition hover:-translate-y-0.5 hover:border-slate-300 hover:text-slate-900"
            @click="openTag(tag.name)"
          >
            {{ tag.name }}
            <span class="archive-cloud-count ml-1 text-[10px] tabular-nums">{{ tag.count }}</span>
          </button>
        </div>
      </section>

      <div v-if="docsStore.loading && !docsStore.docs.length" class="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
        <AppSkeletonLines :rows="8" />
      </div>

      <div v-else class="space-y-8">
        <section
          v-for="group in yearGroups"
          :key="group.year"
          class="archive-year-card rounded-[1.75rem] border border-slate-200 bg-white px-4 py-6 shadow-sm sm:px-8 sm:py-8"
        >
          <div class="flex items-baseline gap-3">
            <h2 class="archive-year text-3xl font-bold tracking-tight text-slate-900">{{ group.year }}</h2>
            <span class="archive-year-count rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-500">
              {{ group.docs.length }} 篇
            </span>
          </div>

          <ul class="archive-list mt-5 space-y-1">
            <li v-for="doc in group.docs" :key="doc.id">
              <button
                type="button"
                class="archive-item group flex w-full items-center gap-4 rounded-2xl px-3 py-3 text-left transition hover:bg-slate-50 sm:px-4"
                @click="openDoc(doc.id)"
              >
                <span class="archive-item-date w-24 flex-none text-xs tabular-nums text-slate-400">
                  {{ doc.createTime.slice(5) }}
                </span>
                <span class="archive-item-title min-w-0 flex-1 truncate text-sm font-medium text-slate-800 sm:text-base">
                  {{ doc.title }}
                </span>
                <span class="hidden flex-none gap-2 sm:flex">
                  <span
                    v-for="tag in doc.tags.slice(0, 2)"
                    :key="tag"
                    class="archive-item-tag rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] text-slate-500"
                  >
                    {{ tag }}
                  </span>
                </span>
                <svg
                  class="h-4 w-4 flex-none text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-slate-500"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  aria-hidden="true"
                >
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </button>
            </li>
          </ul>
        </section>
      </div>
    </div>
  </div>
</template>
