<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useProjectsStore } from '@/store/modules/projects'
import type { ProjectCard, ProjectMetric } from '@/types/content'

interface ProjectFormState {
  id: string
  title: string
  summary: string
  cover: string
  category: string
  period: string
  role: string
  techStacksText: string
  highlightsText: string
  featuresText: string
  outcomesText: string
  responsibilitiesText: string
  metrics: ProjectMetric[]
  sortOrder: number
}

const projectsStore = useProjectsStore()
const dialogVisible = ref(false)
const isEditMode = ref(false)

const createInitialForm = (): ProjectFormState => ({
  id: '',
  title: '',
  summary: '',
  cover: '',
  category: '',
  period: '',
  role: '',
  techStacksText: '',
  highlightsText: '',
  featuresText: '',
  outcomesText: '',
  responsibilitiesText: '',
  metrics: [],
  sortOrder: 0,
})

const formState = reactive<ProjectFormState>(createInitialForm())

const linesToArray = (text: string) =>
  text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)

const resetForm = () => Object.assign(formState, createInitialForm())

const fillForm = (project: ProjectCard) => {
  formState.id = project.id
  formState.title = project.title
  formState.summary = project.summary
  formState.cover = project.cover
  formState.category = project.category
  formState.period = project.period
  formState.role = project.role
  formState.techStacksText = project.techStacks.join('\n')
  formState.highlightsText = project.highlights.join('\n')
  formState.featuresText = project.features.join('\n')
  formState.outcomesText = project.outcomes.join('\n')
  formState.responsibilitiesText = project.responsibilities.join('\n')
  formState.metrics = project.metrics.map((item) => ({ ...item }))
  formState.sortOrder = project.sortOrder
}

onMounted(() => {
  projectsStore.fetchProjects()
})

const openCreateDialog = () => {
  resetForm()
  isEditMode.value = false
  dialogVisible.value = true
}

const openEditDialog = (project: ProjectCard) => {
  fillForm(project)
  isEditMode.value = true
  dialogVisible.value = true
}

const handleSave = async () => {
  if (!formState.title.trim()) {
    ElMessage.warning('请填写项目标题')
    return
  }

  const payload = {
    title: formState.title.trim(),
    summary: formState.summary,
    cover: formState.cover,
    category: formState.category,
    period: formState.period,
    role: formState.role,
    techStacks: linesToArray(formState.techStacksText),
    highlights: linesToArray(formState.highlightsText),
    features: linesToArray(formState.featuresText),
    outcomes: linesToArray(formState.outcomesText),
    responsibilities: linesToArray(formState.responsibilitiesText),
    metrics: formState.metrics.filter((item) => item.label.trim() || item.value.trim()),
    sortOrder: formState.sortOrder,
  }

  try {
    await projectsStore.saveProject(isEditMode.value ? { ...payload, id: formState.id } : payload)
    ElMessage.success(isEditMode.value ? '项目已更新' : '项目已创建')
    dialogVisible.value = false
  } catch {
    // http 拦截器已提示
  }
}

const handleDelete = async (project: ProjectCard) => {
  try {
    await ElMessageBox.confirm(`确定删除项目「${project.title}」吗？删除后不可恢复。`, '删除确认', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning',
    })
  } catch {
    return
  }

  try {
    await projectsStore.deleteProject(project.id)
    ElMessage.success('项目已删除')
  } catch {
    // http 拦截器已提示
  }
}

const addMetric = () => {
  formState.metrics.push({ label: '', value: '' })
}

const removeMetric = (index: number) => {
  formState.metrics.splice(index, 1)
}
</script>

<template>
  <div class="p-4 sm:p-8">
    <div class="mb-6 flex flex-wrap items-center justify-between gap-4">
      <div>
        <p class="app-overline text-xs uppercase tracking-[0.28em]">项目内容</p>
        <h2 class="app-heading mt-2 text-xl font-semibold">项目列表</h2>
        <p class="app-caption mt-2 text-sm">项目展示页与个人介绍页的项目经验共用此数据</p>
      </div>

      <div class="flex gap-3">
        <el-button plain :loading="projectsStore.loading" @click="projectsStore.fetchProjects({ force: true })">
          刷新
        </el-button>
        <el-button type="primary" @click="openCreateDialog">新增项目</el-button>
      </div>
    </div>

    <div class="app-panel rounded-[1.75rem] p-4 sm:p-6">
      <el-table :data="projectsStore.projects" v-loading="projectsStore.loading">
        <el-table-column prop="title" label="标题" min-width="200" />
        <el-table-column prop="category" label="分类" width="140" />
        <el-table-column prop="period" label="周期" width="150" />
        <el-table-column prop="sortOrder" label="排序" width="80" align="center" />
        <el-table-column label="操作" width="150" align="center">
          <template #default="{ row }">
            <el-button link type="primary" @click="openEditDialog(row)">编辑</el-button>
            <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-dialog
      v-model="dialogVisible"
      :title="isEditMode ? '编辑项目' : '新增项目'"
      width="min(860px, 94vw)"
      top="4vh"
      destroy-on-close
    >
      <el-form label-position="top" @submit.prevent="handleSave">
        <div class="grid gap-4 sm:grid-cols-2">
          <el-form-item label="项目标题" required>
            <el-input v-model="formState.title" placeholder="例如：CVita - AI 心理健康助手" />
          </el-form-item>
          <el-form-item label="分类">
            <el-input v-model="formState.category" placeholder="例如：AI 服务平台" />
          </el-form-item>
          <el-form-item label="项目周期">
            <el-input v-model="formState.period" placeholder="例如：2026.01 - 2026.03" />
          </el-form-item>
          <el-form-item label="排序（越小越靠前）">
            <el-input-number v-model="formState.sortOrder" :min="0" :max="999" class="!w-full" />
          </el-form-item>
        </div>

        <el-form-item label="项目简介">
          <el-input v-model="formState.summary" type="textarea" :rows="3" />
        </el-form-item>

        <el-form-item label="职责与角色">
          <el-input v-model="formState.role" type="textarea" :rows="2" />
        </el-form-item>

        <div class="grid gap-4 sm:grid-cols-2">
          <el-form-item label="技术栈（每行一条）">
            <el-input v-model="formState.techStacksText" type="textarea" :rows="5" placeholder="Vue 3&#10;Vite&#10;Element Plus" />
          </el-form-item>
          <el-form-item label="项目亮点（每行一条）">
            <el-input v-model="formState.highlightsText" type="textarea" :rows="5" />
          </el-form-item>
          <el-form-item label="核心能力点（每行一条）">
            <el-input v-model="formState.featuresText" type="textarea" :rows="5" />
          </el-form-item>
          <el-form-item label="项目结果（每行一条）">
            <el-input v-model="formState.outcomesText" type="textarea" :rows="5" />
          </el-form-item>
        </div>

        <el-form-item label="个人职责（每行一条，用于个人介绍页项目经验）">
          <el-input v-model="formState.responsibilitiesText" type="textarea" :rows="4" />
        </el-form-item>

        <el-form-item label="项目指标">
          <div class="w-full space-y-2">
            <div v-for="(metric, index) in formState.metrics" :key="index" class="flex gap-2">
              <el-input v-model="metric.label" placeholder="标签，如：核心模块" class="!w-1/2" />
              <el-input v-model="metric.value" placeholder="值，如：4 大类" class="!w-1/2" />
              <el-button plain type="danger" @click="removeMetric(index)">删除</el-button>
            </div>
            <el-button plain @click="addMetric">添加指标</el-button>
          </div>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="projectsStore.saving" @click="handleSave">保存项目</el-button>
      </template>
    </el-dialog>
  </div>
</template>
