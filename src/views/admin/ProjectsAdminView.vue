<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useProjectsStore } from '@/store/modules/projects'
import { updateProjectApi } from '@/api/modules/projects'
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
const visibilityUpdatingId = ref('')
const reorderSaving = ref(false)

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
  projectsStore.fetchAdminProjects()
})

const handleToggleVisibility = async (project: ProjectCard, visible: boolean) => {
  visibilityUpdatingId.value = project.id

  try {
    await projectsStore.toggleProjectVisibility(project.id, visible)
    ElMessage.success(visible ? `「${project.title}」已在前台展示` : `「${project.title}」已隐藏，前台不再展示`)
  } catch {
    // http 拦截器已提示，switch 绑定的是服务端数据，失败会自动回滚
  } finally {
    visibilityUpdatingId.value = ''
  }
}

const openCreateDialog = () => {
  resetForm()
  // 新项目默认排在末位，具体位置由列表拖动排序调整
  formState.sortOrder = projectsStore.adminProjects.length
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

// ===== 拖动排序：手柄按住拖动整行，松手后按新顺序把 sortOrder 归一化为 0..n-1 并批量保存 =====
const tableWrapperRef = ref<HTMLDivElement | null>(null)
const dragFromIndex = ref(-1)
const dragToIndex = ref(-1)

const findRow = (target: EventTarget | null): HTMLTableRowElement | null => {
  const el = target as HTMLElement | null
  return (el?.closest?.('tr.el-table__row') as HTMLTableRowElement | undefined) ?? null
}

const rowIndex = (row: HTMLTableRowElement): number =>
  Array.from(row.parentElement?.children ?? []).indexOf(row)

const clearIndicators = () => {
  tableWrapperRef.value
    ?.querySelectorAll('tr.drag-over-top, tr.drag-over-bottom')
    .forEach((row) => row.classList.remove('drag-over-top', 'drag-over-bottom'))
}

// 只允许从手柄发起拖动：按下时才把所在行标记为 draggable，避免整行文字/开关被拖
const onHandleMouseDown = (event: MouseEvent) => {
  const handle = (event.target as HTMLElement).closest('.project-drag-handle')
  if (!handle) return
  const row = findRow(handle)
  if (row) row.draggable = true
}

const onDragStart = (event: DragEvent) => {
  const row = findRow(event.target)
  // 行只有在按住手柄时才会被标记为 draggable，由此保证拖动只能从手柄发起
  if (!row || !row.draggable) return
  dragFromIndex.value = rowIndex(row)
  dragToIndex.value = -1
  row.classList.add('is-dragging')
  event.dataTransfer?.setData('text/plain', String(dragFromIndex.value))
  if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move'
}

const onDragOver = (event: DragEvent) => {
  if (dragFromIndex.value < 0) return
  const row = findRow(event.target)
  if (!row) return
  event.preventDefault()
  if (event.dataTransfer) event.dataTransfer.dropEffect = 'move'

  const overIndex = rowIndex(row)
  if (overIndex === dragFromIndex.value) {
    dragToIndex.value = -1
    clearIndicators()
    return
  }

  const rect = row.getBoundingClientRect()
  const before = event.clientY < rect.top + rect.height / 2
  dragToIndex.value = before ? overIndex : overIndex + 1
  clearIndicators()
  row.classList.add(before ? 'drag-over-top' : 'drag-over-bottom')
}

const onDragEnd = () => {
  clearIndicators()
  resetDraggableRows()

  const from = dragFromIndex.value
  const to = dragToIndex.value
  dragFromIndex.value = -1
  dragToIndex.value = -1
  if (from < 0 || to < 0 || from === to) return

  const rows = [...projectsStore.adminProjects]
  const [moved] = rows.splice(from, 1)
  rows.splice(to > from ? to - 1 : to, 0, moved)
  projectsStore.adminProjects = rows
  void persistOrder()
}

// 纯点击手柄未触发拖动时，把行的 draggable 状态复位，避免后续误拖整行
const resetDraggableRows = () => {
  tableWrapperRef.value
    ?.querySelectorAll('tr[draggable="true"]')
    .forEach((row) => ((row as HTMLTableRowElement).draggable = false))
}

const persistOrder = async () => {
  const rows = projectsStore.adminProjects
  const changed = rows
    .map((project, index) => ({ project, index }))
    .filter(({ project, index }) => project.sortOrder !== index)

  if (!changed.length) return

  reorderSaving.value = true
  try {
    // 本地先归一化为 0..n-1，仅把序号变化的行提交到服务端
    rows.forEach((project, index) => {
      project.sortOrder = index
    })
    await Promise.all(
      changed.map(({ project, index }) => {
        const { id, visible: _visible, ...payload } = project
        void _visible
        return updateProjectApi(id, { ...payload, sortOrder: index })
      }),
    )
    ElMessage.success('排序已保存')
  } catch {
    // http 拦截器已提示；强制刷新让列表回到服务端的真实顺序
    await projectsStore.fetchAdminProjects({ force: true })
  } finally {
    reorderSaving.value = false
  }
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
        <el-button plain :loading="projectsStore.adminLoading" @click="projectsStore.fetchAdminProjects({ force: true })">
          刷新
        </el-button>
        <el-button type="primary" @click="openCreateDialog">新增项目</el-button>
      </div>
    </div>

    <div
      ref="tableWrapperRef"
      class="app-panel rounded-[1.75rem] p-4 sm:p-6"
      v-loading="projectsStore.adminLoading || reorderSaving"
      element-loading-text="正在保存排序…"
      @mousedown="onHandleMouseDown"
      @mouseup="resetDraggableRows"
      @dragstart="onDragStart"
      @dragover="onDragOver"
      @dragend="onDragEnd"
      @drop.prevent
    >
      <el-table :data="projectsStore.adminProjects" row-key="id" v-loading="projectsStore.adminLoading">
        <el-table-column label="排序" width="90" align="center">
          <template #default="{ $index }">
            <span class="project-drag-handle" title="按住拖动调整顺序">⠿</span>
            <span class="ml-1 text-xs text-slate-400">{{ $index + 1 }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="title" label="标题" min-width="200" />
        <el-table-column prop="category" label="分类" width="140" />
        <el-table-column prop="period" label="周期" width="150" />
        <el-table-column label="页面展示" width="110" align="center">
          <template #default="{ row }">
            <el-switch
              :model-value="row.visible"
              :loading="visibilityUpdatingId === row.id"
              @change="(value: string | number | boolean) => handleToggleVisibility(row, Boolean(value))"
            />
          </template>
        </el-table-column>
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

<style scoped>
/* 拖动排序手柄：只在手柄上可抓取，行内文字/开关不受影响 */
.project-drag-handle {
  cursor: grab;
  padding: 2px 6px;
  border-radius: 6px;
  color: var(--color-text-subtle);
  font-size: 14px;
  line-height: 1;
  user-select: none;
  touch-action: none;
  transition:
    color 0.2s ease,
    background-color 0.2s ease;
}

.project-drag-handle:hover {
  color: var(--color-primary);
  background: var(--color-surface-soft);
}

.project-drag-handle:active {
  cursor: grabbing;
}

/* 拖动中的行半透明；目标位置用主色插入线提示（box-shadow 不产生布局位移） */
:deep(tr.is-dragging) {
  opacity: 0.45;
}

:deep(tr.drag-over-top td.el-table__cell) {
  box-shadow: inset 0 2px 0 var(--color-primary);
}

:deep(tr.drag-over-bottom td.el-table__cell) {
  box-shadow: inset 0 -2px 0 var(--color-primary);
}
</style>
