<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import Fuse from 'fuse.js'
import AppDrawer from '@/components/common/AppDrawer.vue'
import AppEmptyState from '@/components/common/AppEmptyState.vue'
import SectionTitle from '@/components/common/SectionTitle.vue'
import { useProjectsStore } from '@/store/modules/projects'

const projectsStore = useProjectsStore()

const category = ref('全部')
const keyword = ref('')
const detailVisible = ref(false)
const activeProjectId = ref('')

const projects = computed(() => projectsStore.projects)

const categories = computed(() => [
  '全部',
  ...new Set(projects.value.map((project) => project.category).filter(Boolean)),
])

onMounted(() => {
  projectsStore.fetchProjects()
})

const projectEngine = computed(
  () =>
    new Fuse(projects.value, {
      keys: ['title', 'summary', 'techStacks', 'highlights', 'features'],
      threshold: 0.28,
      ignoreLocation: true,
    }),
)

const filteredProjects = computed(() => {
  const byCategory =
    category.value === '全部'
      ? projects.value
      : projects.value.filter((project) => project.category === category.value)

  if (!keyword.value.trim()) {
    return byCategory
  }

  const resultIds = projectEngine.value.search(keyword.value.trim()).map((item) => item.item.id)
  return byCategory.filter((project) => resultIds.includes(project.id))
})

const activeProject = computed(
  () => projects.value.find((project) => project.id === activeProjectId.value) ?? filteredProjects.value[0] ?? null,
)

const openDetail = (projectId: string) => {
  activeProjectId.value = projectId
  detailVisible.value = true
}
</script>

<template>
  <section class="projects-page px-4 pb-12 sm:px-6 sm:pb-16">
    <div class="mx-auto max-w-7xl">
      <SectionTitle
        eyebrow="项目展示"
        title="持续打磨中的产品与交互实践"
        description="这里收录了近阶段完成的项目，重点关注内容组织、页面交互、业务流程与工程实现之间的平衡。"
      />

      <div class="app-card mt-8 grid gap-4 rounded-[1.75rem] p-4 sm:mt-10 sm:p-5 lg:grid-cols-[1fr_auto] lg:items-center">
        <label class="block">
          <span class="sr-only">搜索项目</span>
          <div class="app-public-input flex items-center gap-3 rounded-2xl px-4 py-3">
            <svg viewBox="0 0 24 24" class="h-4 w-4 shrink-0 text-slate-400" fill="none" stroke="currentColor" stroke-width="1.8">
              <circle cx="11" cy="11" r="6.5" />
              <path d="m16 16 4.5 4.5" />
            </svg>
            <input
              v-model="keyword"
              type="text"
              class="project-search-input min-w-0 flex-1 border-0 bg-transparent p-0 text-sm text-slate-700 outline-none placeholder:text-slate-400"
              placeholder="搜索项目名称、技术栈或亮点"
            />
            <button
              v-if="keyword"
              type="button"
              class="text-xs font-medium text-slate-400 transition hover:text-slate-700"
              @click="keyword = ''"
            >
              清空
            </button>
          </div>
        </label>

        <div class="flex gap-3 overflow-x-auto pb-1 lg:flex-wrap lg:overflow-visible">
          <button
            v-for="item in categories"
            :key="item"
            class="app-filter-button shrink-0 whitespace-nowrap px-5 py-2 text-sm font-medium"
            :class="{ 'is-active': category === item }"
            @click="category = item"
          >
            {{ item }}
          </button>
        </div>
      </div>

      <div class="mt-8 grid gap-5 sm:mt-10 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
        <article
          v-for="project in filteredProjects"
          :key="project.id"
          class="app-card interactive-card group rounded-[1.75rem] p-5 sm:p-6"
        >
          <div>
            <div>
              <p class="app-overline text-sm">{{ project.category }}</p>
              <h3 class="app-heading mt-3 text-xl font-semibold sm:text-2xl">{{ project.title }}</h3>
            </div>
            <p class="app-copy mt-4 text-sm leading-7">{{ project.summary }}</p>
          </div>

          <div class="mt-5 flex flex-wrap gap-2">
            <span v-for="stack in project.techStacks" :key="stack" class="app-tag-pill px-3 py-1 text-xs">
              {{ stack }}
            </span>
          </div>

          <ul class="app-copy mt-5 space-y-2 text-sm">
            <li v-for="item in project.highlights" :key="item">{{ item }}</li>
          </ul>

          <div class="mt-6">
            <button class="app-text-link text-sm font-medium" @click="openDetail(project.id)">
              查看项目详情
            </button>
          </div>
        </article>
      </div>

      <AppEmptyState
        v-if="!filteredProjects.length"
        class="mt-10"
        title="没有找到匹配项目"
        description="可以换个关键词，或者从不同项目类型继续筛选。"
      />
    </div>

    <AppDrawer v-model="detailVisible" :title="activeProject?.title ?? '项目详情'">
      <div v-if="activeProject" class="space-y-8">
        <section class="app-detail-card rounded-[1.5rem] p-5">
          <p class="app-caption text-sm">{{ activeProject.category }} / {{ activeProject.period }}</p>
          <p class="app-copy mt-3 text-base leading-7">{{ activeProject.summary }}</p>
          <div class="mt-4 flex flex-wrap gap-2">
            <span v-for="stack in activeProject.techStacks" :key="stack" class="app-tag-pill px-3 py-1 text-xs">
              {{ stack }}
            </span>
          </div>
        </section>

        <section>
          <h3 class="app-heading text-lg font-semibold">职责与角色</h3>
          <p class="app-copy mt-3 text-sm leading-7">{{ activeProject.role }}</p>
        </section>

        <section>
          <h3 class="app-heading text-lg font-semibold">核心能力点</h3>
          <ul class="app-copy mt-3 space-y-2 text-sm leading-7">
            <li v-for="item in activeProject.features" :key="item">{{ item }}</li>
          </ul>
        </section>

        <section>
          <h3 class="app-heading text-lg font-semibold">项目结果</h3>
          <ul class="app-copy mt-3 space-y-2 text-sm leading-7">
            <li v-for="item in activeProject.outcomes" :key="item">{{ item }}</li>
          </ul>
        </section>
      </div>
    </AppDrawer>
  </section>
</template>
