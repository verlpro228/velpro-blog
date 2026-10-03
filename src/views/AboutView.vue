<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useProjectsStore } from '@/store/modules/projects'
import { useSiteProfileStore } from '@/store/modules/profile'

const projectsStore = useProjectsStore()
const profileStore = useSiteProfileStore()
const profileData = computed(() => profileStore.profile)

const profile = computed(() => ({
  name: profileData.value?.name ?? '',
  target: profileData.value?.target ?? '',
  summary: profileData.value?.summary ?? '',
}))

const contacts = computed(() => profileData.value?.contacts ?? [])
const skillGroups = computed(() => profileData.value?.skillGroups ?? [])
const skillDetails = computed(() => profileData.value?.skillDetails ?? '')
const experiences = computed(() => profileData.value?.experiences ?? [])
const educationList = computed(() => profileData.value?.education ?? [])
const timeline = computed(() => profileData.value?.timeline ?? [])

// 项目经验区块直接复用"项目展示"的项目数据回显
const projectExperiences = computed(() =>
  projectsStore.projects.map((project) => ({
    name: project.title,
    techStacks: project.techStacks,
    summary: project.summary,
    responsibilities: project.responsibilities,
  })),
)

onMounted(() => {
  projectsStore.fetchProjects()
  profileStore.fetchProfile()
})

// ===== 右侧悬浮锚点菜单：定位到右栏各内容区块，滚动时高亮当前区块 =====
const ABOUT_SECTIONS = [
  { id: 'about-skills', label: '专业技能' },
  { id: 'about-experience', label: '工作经验' },
  { id: 'about-projects', label: '项目经验' },
  { id: 'about-education', label: '教育背景' },
  { id: 'about-growth', label: '成长路径' },
]

const activeSection = ref(ABOUT_SECTIONS[0].id)
let rafHandle = 0

// 滚动监听计算当前区块：取"最后一个滚过导航栏下沿（top<=160）"的区块，比 IntersectionObserver
// 对数据加载引起的布局变化更稳定
function updateActiveSection() {
  rafHandle = 0

  let current = ABOUT_SECTIONS[0].id
  for (const section of ABOUT_SECTIONS) {
    const el = document.getElementById(section.id)
    if (el && el.getBoundingClientRect().top <= 160) {
      current = section.id
    }
  }
  activeSection.value = current
}

function scheduleUpdate() {
  if (!rafHandle) {
    rafHandle = requestAnimationFrame(updateActiveSection)
  }
}

onMounted(() => {
  window.addEventListener('scroll', scheduleUpdate, { passive: true })
  scheduleUpdate()
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', scheduleUpdate)
  if (rafHandle) {
    cancelAnimationFrame(rafHandle)
  }
})

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
</script>

<template>
  <section class="about-page px-4 pb-12 sm:px-6 sm:pb-16">
    <div class="mx-auto max-w-7xl">
      <div class="grid gap-6 xl:grid-cols-[minmax(280px,0.32fr)_minmax(0,0.68fr)]">
        <!-- 左栏固定在视口内，内容超高时在左栏内部独立滚动，不随右侧主内容滚走 -->
        <aside class="about-aside-scroll self-start space-y-6 xl:sticky xl:top-24 xl:h-[calc(100vh-7rem)] xl:overflow-y-auto xl:pr-1">
          <section class="app-card rounded-[1.75rem] p-5 sm:p-7">
            <p class="app-overline text-xs uppercase tracking-[0.32em]">在线简历</p>
            <h1 class="app-heading mt-4 text-3xl font-semibold sm:text-4xl">{{ profile.name }}</h1>
            <p class="app-copy mt-3 text-base font-medium">{{ profile.target }}</p>
            <div v-if="profile.summary" class="app-card-strong mt-4 rounded-[1.5rem] p-4 sm:p-5">
              <p class="app-copy whitespace-pre-line text-sm leading-7">{{ profile.summary }}</p>
            </div>
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
          <section id="about-skills" v-if="skillDetails" class="about-section app-card rounded-[1.75rem] p-5 sm:p-7">
            <div class="mb-6">
              <p class="app-overline text-xs uppercase tracking-[0.28em]">专业技能</p>
              <h2 class="app-heading mt-3 text-2xl font-semibold">专业技能</h2>
            </div>
            <div class="app-card-strong rounded-[1.5rem] p-5 sm:p-6">
              <p class="app-copy whitespace-pre-line text-base leading-8">{{ skillDetails }}</p>
            </div>
          </section>

          <section id="about-experience" v-if="experiences.length" class="about-section app-card rounded-[1.75rem] p-5 sm:p-7">
            <p class="app-overline text-xs uppercase tracking-[0.28em]">工作经验</p>
            <h2 class="app-heading mt-3 text-2xl font-semibold">工作经验</h2>
            <div class="mt-6 space-y-4">
              <div v-for="(item, index) in experiences" :key="index"
                class="app-card-strong rounded-[1.5rem] p-5 sm:p-6">
                <div class="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 class="app-heading text-lg font-semibold">{{ item.company }}</h3>
                    <p class="app-copy mt-2 text-sm">{{ item.position }}</p>
                  </div>
                  <span v-if="item.period" class="app-chip px-3 py-1 text-xs">{{ item.period }}</span>
                </div>
                <div v-if="item.content" class="mt-5 pt-4" style="border-top: 1px solid var(--color-border)">
                  <p class="app-caption text-xs uppercase tracking-[0.18em]">工作内容</p>
                  <p class="app-copy mt-2 whitespace-pre-line text-sm leading-7">{{ item.content }}</p>
                </div>
              </div>
            </div>
          </section>

          <section id="about-projects" class="about-section app-card rounded-[1.75rem] p-5 sm:p-7">
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

          <section id="about-education" class="about-section app-card rounded-[1.75rem] p-5 sm:p-7">
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
                <div v-if="item.honors" class="mt-5 pt-4" style="border-top: 1px solid var(--color-border)">
                  <p class="app-caption text-xs uppercase tracking-[0.18em]">获奖经历</p>
                  <p class="app-copy mt-2 whitespace-pre-line text-sm leading-7">{{ item.honors }}</p>
                </div>
              </div>
            </div>
          </section>

          <section id="about-growth" class="about-section app-card rounded-[1.75rem] p-5 sm:p-7">
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

    <!-- 右侧悬浮锚点菜单：定位查看介绍的不同部分（小屏隐藏） -->
    <nav class="about-anchor-nav hidden xl:fixed xl:right-10 xl:top-1/2 xl:z-40 xl:block xl:-translate-y-1/2" aria-label="页面部分导航">
      <!-- 容器无内距无缝隙：五个菜单项完全填满，激活高亮条即唯一背景 -->
      <div class="about-anchor-list flex flex-col overflow-hidden rounded-full border backdrop-blur">
        <button
          v-for="section in ABOUT_SECTIONS"
          :key="section.id"
          type="button"
          class="about-anchor-item w-full px-2 py-2 text-[11px] font-medium transition"
          :class="{ 'is-active': activeSection === section.id }"
          :title="section.label"
          @click="scrollToSection(section.id)"
        >
          {{ section.label }}
        </button>
      </div>
    </nav>
  </section>
</template>

<style scoped>
/* 锚点定位留出固定导航栏高度，避免标题被盖 */
.about-section {
  scroll-margin-top: 6.5rem;
}

/* 右侧悬浮锚点菜单：液态玻璃胶囊，激活项主色高亮 */
.about-anchor-list {
  border-color: rgba(255, 255, 255, 0.6);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.62), rgba(255, 255, 255, 0.36));
  backdrop-filter: blur(16px) saturate(150%);
  -webkit-backdrop-filter: blur(16px) saturate(150%);
  box-shadow:
    0 14px 32px rgba(15, 42, 80, 0.12),
    0 4px 12px rgba(15, 42, 80, 0.07),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
}

:root.theme-dark .about-anchor-list {
  border-color: rgba(148, 197, 255, 0.14);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.04));
  box-shadow:
    0 18px 40px rgba(2, 6, 23, 0.5),
    0 6px 16px rgba(2, 6, 23, 0.35),
    inset 0 1px 0 rgba(255, 255, 255, 0.08);
}

.about-anchor-item {
  color: var(--color-text-muted);
}

.about-anchor-item:hover {
  color: var(--color-primary);
}

.about-anchor-item.is-active {
  background: color-mix(in srgb, var(--color-primary) 14%, transparent);
  color: var(--color-primary);
}

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
