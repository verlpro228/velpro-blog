<script setup lang="ts">
import type { TimelineItem } from '@/types/content'

interface ContactItem {
  label: string
  value: string
  href?: string
}

interface SkillGroup {
  title: string
  items: string[]
}

interface ResumeProject {
  name: string
  techStacks: string[]
  summary: string
  responsibilities: string[]
}

interface EducationItem {
  school: string
  major: string
  period: string
}

const profile = {
  name: 'Velpro',
  target: '前端开发工程师',
  summary: '专注 Vue 3、企业后台与内容平台建设，关注工程化质量、业务闭环与用户体验。',
}

const contacts: ContactItem[] = [
  { label: '手机号', value: '135xxxxxxxx' },
  { label: '邮箱', value: 'xxxxxxx@163.com' },
  { label: 'GitHub', value: 'https://github.com/verlpro228/velpro-blog' },
  { label: '博客', value: '站内知识库', href: '/knowledge' },
]

const skillGroups: SkillGroup[] = [
  {
    title: '基础',
    items: ['HTML5 / CSS3 / JavaScript ES6+', 'TypeScript', '响应式布局 / 移动端适配', 'HTTP / RESTful API 协作'],
  },
  {
    title: '框架',
    items: ['Vue 3', 'Pinia / Vuex', 'Vue Router', 'Element Plus / Vant', 'Uniapp'],
  },
  {
    title: '工程化',
    items: ['Vite', 'Axios 封装', '动态路由与权限控制', 'Mock / 状态持久化', 'Git / pnpm'],
  },
]

const projectExperiences: ResumeProject[] = [
  {
    name: 'CVita - AI心理健康助手',
    techStacks: ['Vue 3', 'Vite', 'Element Plus', 'Pinia', 'ECharts', 'Axios', 'SSE'],
    summary:
      '基于 Vue 3 的 AI 心理健康服务平台，包含智能心理咨询、情绪日记、知识库 CMS 与后台数据分析模块，形成前后台双端闭环。',
    responsibilities: [
      '独立负责前端架构设计与核心模块拆分，完成用户端与后台管理端的页面搭建',
      '实现基于 SSE 的流式 AI 对话、情绪识别与风险预警反馈链路',
      '开发情绪日记、知识库 CMS、数据可视化看板等核心业务模块',
      '封装请求拦截、路由守卫与通用组件，统一权限控制与交互反馈',
    ],
  },
  {
    name: 'Vue3 企业级智能工单与服务预约管理平台',
    techStacks: ['Vue 3', 'Vite', 'Vant 4', 'Element Plus', 'Axios', 'Pinia / Vuex', 'QRCode'],
    summary:
      '面向企业客户和内部运营的双端服务调度平台，覆盖服务预约、工单派发、人员管理、权限控制与数据监控等完整流程。',
    responsibilities: [
      '主导 H5 客户端与 PC 管理端基础工程搭建，统一前端技术栈与目录规范',
      '实现 RBAC 动态权限体系、动态路由注册与按钮级权限控制',
      '完成工单状态流转、支付倒计时、服务进度追踪等关键业务逻辑开发',
      '提取 SearchForm、DataTable、UploadImage 等复用组件，提升开发效率',
    ],
  },
  {
    name: '医疗陪诊服务小程序',
    techStacks: ['Uniapp', 'Vue 3', '微信小程序', 'Composition API', 'Vite', 'SCSS'],
    summary:
      '独立开发的医疗陪诊服务微信小程序，面向医院陪诊、代跑取药等场景，完成下单、支付、履约与服务对象管理等业务闭环。',
    responsibilities: [
      '负责小程序整体页面架构与组件化方案设计，组织核心业务流程',
      '实现多服务类型差异化下单、订单状态流转与支付倒计时能力',
      '接入微信登录、地址选择、导航等原生能力，完善用户服务链路',
      '封装导航栏、日期时间选择器、倒计时与分享弹窗等业务组件',
    ],
  },
]

const educationList: EducationItem[] = [
  {
    school: 'xx大学',
    major: '本科 - 数据科学与大数据技术',
    period: '2023 - 2027',
  },
]

const timeline: TimelineItem[] = [
  {
    id: '1',
    title: '夯实基础：HTML / CSS / JavaScript 核心语法与 DOM 操作',
    period: '2025.09 - 2025.11',
    description:
      '掌握语义化标签、盒模型、Flex/Grid 布局与响应式设计原则。\n深入理解作用域链、闭包、事件循环和异步编程，建立对浏览器渲染流程的基础认知。',
  },
  {
    id: '2',
    title: '网络通信入门：Ajax 请求与前后端数据交互实践',
    period: '2025.12',
    description:
      '熟练使用 fetch 与 axios 发起 HTTP 请求，处理 GET/POST 方法及参数传递。\n理解跨域原理与 JSON 数据解析流程，逐步建立前端客户端视角。',
  },
  {
    id: '3',
    title: '框架进阶：Vue 3 组合式 API 与组件化开发体系搭建',
    period: '2026.01 - 2026.02',
    description:
      '系统学习 Composition API、响应式系统与生命周期管理。\n实践单文件组件开发模式，集成 Vue Router 与 Pinia/Vuex 组织页面与状态。',
  },
  {
    id: '4',
    title: '工程化落地：从项目实战到架构思维成型',
    period: '2026.03 - 至今',
    description:
      '独立构建包含 H5 用户端与 PC 管理后台的双端应用，覆盖 CRUD、权限控制、订单流程等核心业务。\n引入 Vite、Axios 拦截器、动态路由生成与规范化工程流程，形成完整开发闭环意识。',
  },
]
</script>

<template>
  <section class="px-4 pb-12 sm:px-6 sm:pb-16">
    <div class="mx-auto max-w-7xl">
      <div class="grid gap-6 xl:grid-cols-[minmax(280px,0.32fr)_minmax(0,0.68fr)]">
        <aside class="self-start space-y-6 xl:sticky xl:top-6">
          <section class="app-card rounded-[1.75rem] p-5 sm:p-7">
            <p class="app-overline text-xs uppercase tracking-[0.32em]">在线简历</p>
            <h1 class="app-heading mt-4 text-3xl font-semibold sm:text-4xl">{{ profile.name }}</h1>
            <p class="app-copy mt-3 text-base font-medium">{{ profile.target }}</p>
            <p class="app-copy mt-4 text-sm leading-7">{{ profile.summary }}</p>
          </section>

          <section class="app-card rounded-[1.75rem] p-5 sm:p-7">
            <h2 class="app-heading text-lg font-semibold">联系方式</h2>
            <div class="mt-5 space-y-4">
              <div v-for="item in contacts" :key="item.label" class="resume-side-card rounded-2xl px-4 py-3">
                <p class="app-caption text-xs uppercase tracking-[0.18em]">{{ item.label }}</p>
                <a v-if="item.href" :href="item.href"
                  class="resume-side-link app-copy mt-2 block break-all text-sm font-medium" target="_blank"
                  rel="noreferrer">
                  {{ item.value }}
                </a>
                <p v-else class="resume-side-value app-copy mt-2 text-sm font-medium">{{ item.value }}</p>
              </div>
            </div>
          </section>

          <section class="app-card rounded-[1.75rem] p-5 sm:p-7">
            <h2 class="app-heading text-lg font-semibold">专业技能</h2>
            <div class="mt-5 space-y-5">
              <div v-for="group in skillGroups" :key="group.title" class="resume-side-card rounded-2xl px-4 py-4">
                <p class="app-caption text-xs uppercase tracking-[0.18em]">{{ group.title }}</p>
                <ul class="mt-3 space-y-2">
                  <li v-for="item in group.items" :key="item" class="resume-skill-item app-copy text-sm leading-6">
                    {{ item }}
                  </li>
                </ul>
              </div>
            </div>
          </section>
        </aside>

        <div class="space-y-6">
          <section class="app-card rounded-[1.75rem] p-5 sm:p-7">
            <div class="mb-6">
              <p class="app-overline text-xs uppercase tracking-[0.28em]">项目经验</p>
              <h2 class="app-heading mt-3 text-2xl font-semibold">项目经验</h2>
            </div>

            <div class="space-y-5">
              <article v-for="project in projectExperiences" :key="project.name"
                class="app-card-strong rounded-[1.5rem] p-5 sm:p-6">
                <div class="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 class="app-heading text-lg font-semibold sm:text-xl">{{ project.name }}</h3>
                    <div class="mt-4 flex flex-wrap gap-2">
                      <span v-for="stack in project.techStacks" :key="stack" class="app-tag-pill px-3 py-1 text-xs">
                        {{ stack }}
                      </span>
                    </div>
                  </div>
                </div>
                <p class="app-copy mt-5 text-sm leading-7">{{ project.summary }}</p>
                <div class="mt-5">
                  <p class="app-caption text-xs uppercase tracking-[0.18em]">个人职责</p>
                  <ul class="app-copy mt-3 space-y-2 text-sm leading-7">
                    <li v-for="item in project.responsibilities" :key="item">{{ item }}</li>
                  </ul>
                </div>
              </article>
            </div>
          </section>

          <section class="app-card rounded-[1.75rem] p-5 sm:p-7">
            <p class="app-overline text-xs uppercase tracking-[0.28em]">教育背景</p>
            <h2 class="app-heading mt-3 text-2xl font-semibold">教育背景</h2>
            <div class="mt-6 space-y-4">
              <div v-for="item in educationList" :key="`${item.school}-${item.period}`"
                class="app-card-strong rounded-[1.5rem] p-5 sm:p-6">
                <div class="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 class="app-heading text-lg font-semibold">{{ item.school }}</h3>
                    <p class="app-copy mt-2 text-sm">{{ item.major }}</p>
                  </div>
                  <span class="app-chip px-3 py-1 text-xs">{{ item.period }}</span>
                </div>
              </div>
            </div>
          </section>

          <section class="app-card rounded-[1.75rem] p-5 sm:p-7">
            <p class="app-overline text-xs uppercase tracking-[0.28em]">成长路径</p>
            <h2 class="app-heading mt-3 text-2xl font-semibold">技术成长路径</h2>
            <div class="resume-timeline mt-6">
              <article v-for="item in timeline" :key="item.id" class="resume-timeline-item relative pl-6 sm:pl-8">
                <div class="resume-timeline-node absolute left-0 top-2 h-3.5 w-3.5 rounded-full" />
                <div class="app-card-strong rounded-2xl p-5">
                  <p class="app-overline text-xs uppercase tracking-[0.18em]">{{ item.period }}</p>
                  <h3 class="app-heading mt-3 text-lg font-semibold">{{ item.title }}</h3>
                  <p class="app-copy mt-3 whitespace-pre-line text-sm leading-7">{{ item.description }}</p>
                </div>
              </article>
            </div>
          </section>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.resume-side-card {
  border: 1px solid var(--color-border);
  background: var(--color-surface-strong);
  box-shadow: var(--shadow-panel);
  transition:
    border-color 0.25s ease,
    background-color 0.25s ease,
    box-shadow 0.25s ease,
    color 0.25s ease;
}

.resume-side-link,
.resume-side-value,
.resume-skill-item {
  color: var(--color-text-muted);
  transition: color 0.25s ease;
}

.resume-side-link:hover {
  color: var(--color-primary);
}

.resume-timeline {
  position: relative;
}

.resume-timeline::before {
  content: '';
  position: absolute;
  left: 0.4rem;
  top: 0.5rem;
  bottom: 0.5rem;
  width: 1px;
  background: var(--color-border);
}

.resume-timeline-item+.resume-timeline-item {
  margin-top: 1.25rem;
}

.resume-timeline-node {
  background: var(--color-primary);
  box-shadow: 0 0 0 6px rgba(34, 211, 238, 0.14);
}

@media (max-width: 639px) {
  .resume-timeline::before {
    left: 0.28rem;
  }
}
</style>
