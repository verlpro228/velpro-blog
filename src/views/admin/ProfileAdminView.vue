<script setup lang="ts">
import { onMounted, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { useSiteProfileStore } from '@/store/modules/profile'
import type { ContactItem, EducationItem, SiteProfile, TimelineItem } from '@/types/content'

interface SkillGroupForm {
  title: string
  itemsText: string
}

interface ProfileFormState {
  name: string
  target: string
  summary: string
  contacts: ContactItem[]
  skillGroups: SkillGroupForm[]
  education: EducationItem[]
  timeline: TimelineItem[]
}

const profileStore = useSiteProfileStore()

const form = reactive<ProfileFormState>({
  name: '',
  target: '',
  summary: '',
  contacts: [],
  skillGroups: [],
  education: [],
  timeline: [],
})

const fillForm = (data: SiteProfile) => {
  form.name = data.name
  form.target = data.target
  form.summary = data.summary
  form.contacts = data.contacts.map((item) => ({ ...item }))
  form.skillGroups = data.skillGroups.map((group) => ({
    title: group.title,
    itemsText: group.items.join('\n'),
  }))
  form.education = data.education.map((item) => ({
    school: item.school ?? '',
    major: item.major ?? '',
    period: item.period ?? '',
    honors: item.honors ?? '',
  }))
  form.timeline = data.timeline.map((item) => ({ ...item }))
}

onMounted(async () => {
  await profileStore.fetchProfile()

  // 拉取失败时保留空表单（可当作新建），http 拦截器已提示错误
  if (profileStore.profile) {
    fillForm(profileStore.profile)
  }
})

const handleSave = async () => {
  if (!form.name.trim()) {
    ElMessage.warning('请填写姓名')
    return
  }

  try {
    await profileStore.saveProfile({
      name: form.name.trim(),
      target: form.target,
      summary: form.summary,
      contacts: form.contacts.filter((item) => item.label.trim() && item.value.trim()),
      skillGroups: form.skillGroups
        .filter((group) => group.title.trim())
        .map((group) => ({
          title: group.title,
          items: group.itemsText
            .split('\n')
            .map((line) => line.trim())
            .filter(Boolean),
        })),
      education: form.education.filter((item) => item.school.trim()),
      timeline: form.timeline
        .filter((item) => item.title.trim())
        .map((item, index) => ({ ...item, id: item.id || String(index + 1) })),
    })

    ElMessage.success('个人介绍已保存')
  } catch {
    // http 拦截器已提示
  }
}

const addContact = () => form.contacts.push({ label: '', value: '', href: '' })
const removeContact = (index: number) => form.contacts.splice(index, 1)

const addSkillGroup = () => form.skillGroups.push({ title: '', itemsText: '' })
const removeSkillGroup = (index: number) => form.skillGroups.splice(index, 1)

const addEducation = () => form.education.push({ school: '', major: '', period: '', honors: '' })
const removeEducation = (index: number) => form.education.splice(index, 1)

const addTimeline = () =>
  form.timeline.push({ id: String(Date.now()), title: '', period: '', description: '' })
const removeTimeline = (index: number) => form.timeline.splice(index, 1)
</script>

<template>
  <div v-loading="profileStore.loading" class="space-y-6 p-4 sm:p-8">
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <p class="app-overline text-xs uppercase tracking-[0.28em]">个人介绍页</p>
        <h2 class="app-heading mt-2 text-xl font-semibold">介绍内容管理</h2>
        <p class="app-caption mt-2 text-sm">管理"个人介绍"页展示的全部信息</p>
      </div>

      <el-button type="primary" :loading="profileStore.saving" @click="handleSave">保存全部</el-button>
    </div>

    <section class="app-panel rounded-[1.75rem] p-6 sm:p-8">
      <h3 class="app-heading text-lg font-semibold">基本信息</h3>
      <el-form class="mt-6" label-position="top">
        <div class="grid gap-4 sm:grid-cols-2">
          <el-form-item label="姓名" required>
            <el-input v-model="form.name" />
          </el-form-item>
          <el-form-item label="岗位 / 意向">
            <el-input v-model="form.target" placeholder="例如：前端开发工程师" />
          </el-form-item>
        </div>
        <el-form-item label="个人简介">
          <el-input v-model="form.summary" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
    </section>

    <section class="app-panel rounded-[1.75rem] p-6 sm:p-8">
      <h3 class="app-heading text-lg font-semibold">联系方式</h3>
      <div class="mt-6 space-y-3">
        <div v-for="(item, index) in form.contacts" :key="index" class="grid gap-2 sm:grid-cols-[140px_1fr_1fr_auto]">
          <el-input v-model="item.label" placeholder="标签，如：邮箱" />
          <el-input v-model="item.value" placeholder="展示内容" />
          <el-input v-model="item.href" placeholder="跳转链接（可选）" />
          <el-button plain type="danger" @click="removeContact(index)">删除</el-button>
        </div>
        <el-button plain @click="addContact">添加联系方式</el-button>
      </div>
    </section>

    <section class="app-panel rounded-[1.75rem] p-6 sm:p-8">
      <h3 class="app-heading text-lg font-semibold">专业技能</h3>
      <div class="mt-6 space-y-4">
        <div v-for="(group, index) in form.skillGroups" :key="index" class="app-card rounded-2xl p-4">
          <div class="flex gap-2">
            <el-input v-model="group.title" placeholder="分组名，如：基础" class="!w-48" />
            <el-button plain type="danger" @click="removeSkillGroup(index)">删除分组</el-button>
          </div>
          <el-input
            v-model="group.itemsText"
            class="mt-3"
            type="textarea"
            :rows="4"
            placeholder="技能项，每行一条"
          />
        </div>
        <el-button plain @click="addSkillGroup">添加技能分组</el-button>
      </div>
    </section>

    <section class="app-panel rounded-[1.75rem] p-6 sm:p-8">
      <h3 class="app-heading text-lg font-semibold">教育背景</h3>
      <div class="mt-6 space-y-4">
        <div v-for="(item, index) in form.education" :key="index" class="app-card rounded-2xl p-4">
          <div class="grid gap-2 sm:grid-cols-[1fr_1fr_160px_auto]">
            <el-input v-model="item.school" placeholder="学校" />
            <el-input v-model="item.major" placeholder="学历 - 专业" />
            <el-input v-model="item.period" placeholder="时间，如：2023 - 2027" />
            <el-button plain type="danger" @click="removeEducation(index)">删除</el-button>
          </div>
          <el-input v-model="item.honors" class="mt-3" type="textarea" :rows="3"
            placeholder="获奖经历（可选）：顿号分隔或手动换行" />
        </div>
        <el-button plain @click="addEducation">添加教育经历</el-button>
      </div>
    </section>

    <section class="app-panel rounded-[1.75rem] p-6 sm:p-8">
      <h3 class="app-heading text-lg font-semibold">成长路径</h3>
      <div class="mt-6 space-y-4">
        <div v-for="(item, index) in form.timeline" :key="item.id || index" class="app-card rounded-2xl p-4">
          <div class="grid gap-2 sm:grid-cols-[180px_1fr_auto]">
            <el-input v-model="item.period" placeholder="时间，如：2025.09 - 2025.11" />
            <el-input v-model="item.title" placeholder="阶段标题" />
            <el-button plain type="danger" @click="removeTimeline(index)">删除</el-button>
          </div>
          <el-input
            v-model="item.description"
            class="mt-3"
            type="textarea"
            :rows="3"
            placeholder="阶段描述，支持多行"
          />
        </div>
        <el-button plain @click="addTimeline">添加成长阶段</el-button>
      </div>
    </section>

    <div class="flex justify-end pb-4">
      <el-button type="primary" :loading="profileStore.saving" @click="handleSave">保存全部</el-button>
    </div>
  </div>
</template>
