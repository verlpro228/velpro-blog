<script setup lang="ts">
import { computed, ref } from 'vue'
import Fuse from 'fuse.js'
import AppDrawer from '@/components/common/AppDrawer.vue'
import AppEmptyState from '@/components/common/AppEmptyState.vue'
import SectionTitle from '@/components/common/SectionTitle.vue'
import type { ProjectCard } from '@/types/content'

const category = ref('全部')
const keyword = ref('')
const detailVisible = ref(false)
const activeProjectId = ref('')

const categories = ['全部', 'AI 服务平台', '前端工具 SaaS', '微信小程序']

const projects: ProjectCard[] = [
  {
    id: 'cvita',
    title: 'CVita - AI 心理健康助手',
    summary:
      '基于 Vue 3 的 AI 心理健康服务平台，整合智能对话、情绪日记、内容知识库与运营分析能力。',
    cover: '',
    techStacks: ['Vue 3', 'Vite', 'Element Plus', 'Pinia', 'Vue Router', 'ECharts', 'Axios', 'SSE'],
    category: 'AI 服务平台',
    period: '2026.01 - 2026.03',
    role: '负责前端架构设计与核心模块开发，覆盖用户端与后台内容管理端。',
    highlights: ['SSE 流式对话', '情绪识别与风险分级', '知识库 CMS + 数据分析后台'],
    features: [
      '支持多会话 AI 对话与历史记录检索',
      '支持情绪日志记录、趋势分析与反馈建议',
      '支持内容发布、编辑、标签管理与图文预览',
      '通过数据看板可视化核心业务指标',
    ],
    outcomes: [
      '形成用户端与后台端协同闭环',
      '显著提升内容运营效率与分析效率',
      '完成可持续迭代的前端工程结构',
    ],
    metrics: [
      { label: '核心模块', value: '4 大类' },
      { label: '风险分级', value: '4 级' },
      { label: '情绪标签', value: '8 类' },
    ],
  },
  {
    id: 'cvita-resume-platform',
    title: 'CVita 在线简历生成平台',
    summary:
      '一款纯前端、零后端依赖的在线简历生成工具，支持简历编辑、实时预览、模板切换、PDF 导出与 JSON 备份，强调低门槛、隐私安全与跨设备使用体验。',
    cover: '',
    techStacks: ['Vue 3', 'Vite 8', 'Vue Router 4', 'Element Plus', 'Tailwind CSS', 'GSAP 3', 'html2canvas', 'jsPDF'],
    category: '前端工具 SaaS',
    period: '2025',
    role: '独立负责产品设计、前端架构与核心功能开发，完成首页、模板中心、编辑器、预览页与部署上线全流程。',
    highlights: ['纯前端零后端依赖', '6 套模板一键切换', 'PDF 导出 + JSON 导入导出'],
    features: [
      '设计统一数据 Schema，支持教育背景、项目经历、技能特长等 9 类简历模块灵活配置',
      '实现左右分栏实时预览编辑器，左侧表单编辑与右侧 A4 简历预览同步更新',
      '基于 html2canvas + jsPDF 实现高精度 PDF 导出，并处理字体加载、分页切割与图片兼容问题',
      '支持 LocalStorage 本地持久化、JSON 导入导出、模块拖拽排序、深色模式与响应式布局',
    ],
    outcomes: [
      '形成从首页引导、模板选择、内容编辑到导出交付的完整产品闭环',
      '在纯前端架构下兼顾了隐私安全、部署成本与可扩展性',
      '适合作为前端工程化、交互设计与工具型 SaaS 产品能力的综合展示案例',
    ],
    metrics: [
      { label: '模板数量', value: '6 套' },
      { label: '简历模块', value: '9 类' },
      { label: '导出能力', value: 'PDF / JSON' },
    ],
  },
  {
    id: 'medical-mini-program',
    title: '医疗陪诊服务小程序',
    summary:
      '基于 UniApp + Vue 3 的陪诊服务小程序，提供陪诊、取药、送检等服务场景下的完整下单流程。',
    cover: '',
    techStacks: ['UniApp', 'Vue 3', 'Composition API', 'Vite', 'SCSS'],
    category: '微信小程序',
    period: '2026.03 - 2026.04',
    role: '独立负责项目架构、核心业务功能开发与微信生态能力接入。',
    highlights: ['多服务类型下单', '订单全生命周期管理', '登录/导航/支付能力接入'],
    features: [
      '支持陪诊、代取药、送结果等多类型服务下单',
      '支持订单创建、支付倒计时、状态流转与取消',
      '支持就诊人信息管理与复用',
      '封装导航栏、时间选择器、倒计时等业务组件',
    ],
    outcomes: [
      '打通从浏览到下单支付的完整链路',
      '建立统一一致的小程序交互体验',
      '为后续多平台适配保留扩展空间',
    ],
    metrics: [
      { label: '服务类型', value: '6 种' },
      { label: '业务组件', value: '5+' },
      { label: '闭环流程', value: '下单到履约' },
    ],
  },
]

const projectEngine = computed(
  () =>
    new Fuse(projects, {
      keys: ['title', 'summary', 'techStacks', 'highlights', 'features'],
      threshold: 0.28,
      ignoreLocation: true,
    }),
)

const filteredProjects = computed(() => {
  const byCategory =
    category.value === '全部'
      ? projects
      : projects.filter((project) => project.category === category.value)

  if (!keyword.value.trim()) {
    return byCategory
  }

  const resultIds = projectEngine.value.search(keyword.value.trim()).map((item) => item.item.id)
  return byCategory.filter((project) => resultIds.includes(project.id))
})

const activeProject = computed(
  () => projects.find((project) => project.id === activeProjectId.value) ?? filteredProjects.value[0] ?? null,
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
