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

const categories = ['全部', 'AI 服务平台', '企业服务平台', '微信小程序']

const projects: ProjectCard[] = [
  {
    id: 'cvita',
    title: 'CVita - AI心理健康助手',
    summary:
      '一款基于 Vue 3 的 AI 心理健康服务平台，整合智能心理咨询、情绪日记、知识库 CMS 与后台数据分析，为用户提供持续陪伴与内容支持。',
    cover: '',
    techStacks: ['Vue 3', 'Vite', 'Element Plus', 'Pinia', 'Vue Router', 'SCSS', 'ECharts', 'Axios', 'WangEditor', 'SSE'],
    category: 'AI 服务平台',
    period: '2025.12 - 2026.03',
    role: '独立负责前端架构设计与核心功能开发，覆盖用户端与后台管理端页面搭建、数据流组织、权限体系与 AI 交互体验实现。',
    highlights: ['SSE 流式 AI 对话', '情绪识别与四级风险预警', '情绪日记 + 知识库 CMS + 数据分析后台'],
    features: [
      '实现 AI 智能心理咨询，支持多会话切换、历史记录查看、风险等级评估与个性化建议生成',
      '搭建情绪日记系统，记录情绪评分、触发因素、睡眠质量和压力水平等多维数据',
      '开发心理健康知识库与后台 CMS，支持文章管理、推荐阅读、富文本编辑与封面图上传',
      '构建数据分析后台，使用 ECharts 展示情绪趋势、咨询统计与核心业务指标',
    ],
    outcomes: [
      '形成完整的前台用户端与后台管理端双端闭环',
      '落地 AI 流式对话与实时情绪分析能力，提升陪伴与反馈体验',
      '构建可持续维护的知识 CMS 与可视化分析体系',
    ],
    metrics: [
      { label: '核心模块', value: '4 大类' },
      { label: '风险等级', value: '4 级' },
      { label: '情绪标签', value: '8 种' },
    ],
  },
  {
    id: 'smart-service-platform',
    title: 'Vue3 企业级智能工单与服务预约管理平台',
    summary:
      '一套面向企业客户及内部运营的高效服务调度系统，包含 H5 客户服务端与 PC 运营管理端，覆盖服务预约、工单流转、人员调度、权限控制与数据监控。',
    cover: '',
    techStacks: ['Vue 3', 'Vite', 'Vant 4', 'Element Plus', 'Vue Router', 'Axios', 'Pinia / Vuex', 'persistedstate', 'QRCode', 'Less', 'SCSS'],
    category: '企业服务平台',
    period: '2025.12 - 2026.02',
    role: '主导前端架构选型并负责 H5 客户端与 PC 管理端的核心模块开发，完成动态权限体系、工单流程、支付流程与公共组件体系建设。',
    highlights: ['H5 客户端 + PC 管理端双端协同', 'RBAC 动态权限与动态路由注册', '工单状态机与支付倒计时流程'],
    features: [
      'H5 端支持服务大厅、服务预约、我的工单、进度追踪、支付结算与个人中心',
      'PC 端支持数据看板、角色权限、技术人员管理、工单调度、服务类目配置与异常工单处理',
      '基于后端菜单树实现动态路由注册，结合全局守卫与按钮级权限指令完成细粒度权限控制',
      '封装 SearchForm、DataTable、UploadImage、Countdown 等业务组件与统一 Axios 请求模块',
    ],
    outcomes: [
      '成功交付稳定运行的服务预约管理系统，支撑日常工单提交、调度与运营管理流程',
      '实现多角色、多部门协同的权限配置体系，满足企业内部精细化管理需求',
      '通过路由懒加载、图片压缩与 Gzip 等手段将首屏加载速度提升约 40%',
    ],
    metrics: [
      { label: '系统端数', value: '2 端' },
      { label: '角色类型', value: '4 类' },
      { label: '工单状态', value: '5 种' },
    ],
  },
  {
    id: 'medical-mini-program',
    title: '医疗陪诊服务小程序',
    summary:
      '独立开发的一款基于 Uniapp + Vue 3 的医疗陪诊服务微信小程序，为用户提供医院陪诊、代跑取药等医疗辅助服务，覆盖下单、支付与履约完整流程。',
    cover: '',
    techStacks: ['Uniapp', 'Vue 3', '微信小程序', 'Composition API', 'Vite', 'SCSS'],
    category: '微信小程序',
    period: '2026.01 - 2026.02',
    role: '独立负责项目架构设计、核心业务开发、微信生态能力接入与通用组件封装。',
    highlights: ['6 种服务类型的差异化下单流程', '订单全生命周期管理', '微信登录、导航与支付能力接入'],
    features: [
      '服务下单系统支持就医陪诊、接送陪诊、代跑取药、送取结果、上门服务等场景',
      '实现订单创建、支付倒计时、状态流转与取消订单等完整流程',
      '支持就诊人信息增删改查，下单时可快速选择服务对象',
      '封装自定义导航栏、日期时间选择器、倒计时组件、分享弹窗等 5+ 业务组件',
    ],
    outcomes: [
      '完成从浏览、下单、支付到服务完成的完整业务闭环',
      '基于 WeUI 设计规范建立统一的页面视觉与交互体验',
      '为扩展至支付宝、百度等小程序平台预留适配空间',
    ],
    metrics: [
      { label: '服务类型', value: '6 种' },
      { label: '业务组件', value: '5+' },
      { label: '业务闭环', value: '下单到完成' },
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

  const results = projectEngine.value.search(keyword.value.trim()).map((item) => item.item.id)
  return byCategory.filter((project) => results.includes(project.id))
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
  <section class="px-4 pb-12 sm:px-6 sm:pb-16">
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
              class="min-w-0 flex-1 border-0 bg-transparent p-0 text-sm text-slate-700 outline-none placeholder:text-slate-400"
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
            <div class="flex flex-col items-start gap-3 sm:flex-row sm:justify-between">
              <div>
                <p class="app-overline text-sm">{{ project.category }}</p>
                <h3 class="app-heading mt-3 text-xl font-semibold sm:text-2xl">{{ project.title }}</h3>
              </div>
              <span class="app-chip px-3 py-1 text-xs">{{ project.period }}</span>
            </div>
            <p class="app-copy mt-4 text-sm leading-7">{{ project.summary }}</p>
          </div>

          <div class="mt-5 flex flex-wrap gap-2">
            <span
              v-for="stack in project.techStacks"
              :key="stack"
              class="app-tag-pill px-3 py-1 text-xs"
            >
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
            <span
              v-for="stack in activeProject.techStacks"
              :key="stack"
              class="app-tag-pill px-3 py-1 text-xs"
            >
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
