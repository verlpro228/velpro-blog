<script setup lang="ts">
import { computed, onMounted } from 'vue'
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
          <section v-if="skillDetails" class="app-card rounded-[1.75rem] p-5 sm:p-7">
            <div class="mb-6">
              <p class="app-overline text-xs uppercase tracking-[0.28em]">专业技能</p>
              <h2 class="app-heading mt-3 text-2xl font-semibold">专业技能</h2>
            </div>
            <div class="app-card-strong rounded-[1.5rem] p-5 sm:p-6">
              <p class="app-copy whitespace-pre-line text-base leading-8">{{ skillDetails }}</p>
            </div>
          </section>

          <section v-if="experiences.length" class="app-card rounded-[1.75rem] p-5 sm:p-7">
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
                <div v-if="item.honors" class="mt-5 pt-4" style="border-top: 1px solid var(--color-border)">
                  <p class="app-caption text-xs uppercase tracking-[0.18em]">获奖经历</p>
                  <p class="app-copy mt-2 whitespace-pre-line text-sm leading-7">{{ item.honors }}</p>
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
