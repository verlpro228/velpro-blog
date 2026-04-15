<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import type { InputInstance, UploadRequestOptions } from 'element-plus'
import { ElMessage } from 'element-plus'
import { STORAGE_KEYS } from '@/constants/app'
import { useAsyncMarkdown } from '@/hooks/useAsyncMarkdown'
import { useDocsStore } from '@/store/modules/docs'
import type { DocMutationPayload } from '@/types/content'
import { getLocalStorage, removeLocalStorage, setLocalStorage } from '@/utils/storage'

type EditorMode = 'write' | 'preview' | 'split'
type ConfirmButtonType = 'primary' | 'danger' | 'warning'

interface DocFormState {
  id: string
  title: string
  summary: string
  tags: string[]
  content: string
}

interface DraftPayload extends DocFormState {
  savedAt: string
}

interface ConfirmDialogOptions {
  confirmButtonText?: string
  cancelButtonText?: string
  confirmButtonType?: ConfirmButtonType
}

interface ConfirmDialogState {
  visible: boolean
  title: string
  message: string
  confirmButtonText: string
  cancelButtonText: string
  confirmButtonType: ConfirmButtonType
}

const docsStore = useDocsStore()
const dialogVisible = ref(false)
const isEditMode = ref(false)
const editorMode = ref<EditorMode>('split')
const draftSavedAt = ref('')
const markdownInputRef = ref<InputInstance>()
const initialSnapshot = ref('')

const createInitialState = (): DocFormState => ({
  id: '',
  title: '',
  summary: '',
  tags: [],
  content: '# 新文档\n\n从这里开始撰写内容。',
})

const formState = reactive<DocFormState>(createInitialState())
const { html: previewContent, loading: previewLoading, render: renderPreview } = useAsyncMarkdown()

const syncLabel = computed(() => {
  if (!docsStore.lastFetchedAt) {
    return '等待首次同步'
  }

  return new Date(docsStore.lastFetchedAt).toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
})

const stats = computed(() => {
  const plainText = formState.content.replace(/[#>*`\-\n\r]/g, '').trim()
  const charCount = plainText.length
  const headingCount = (formState.content.match(/^#{1,6}\s+/gm) ?? []).length
  const estimatedMinutes = Math.max(1, Math.ceil(charCount / 320))

  return {
    charCount,
    headingCount,
    estimatedMinutes,
  }
})

const currentSnapshot = computed(() =>
  JSON.stringify({
    ...formState,
    tags: [...formState.tags].sort(),
  }),
)

const hasUnsavedChanges = computed(
  () => dialogVisible.value && currentSnapshot.value !== initialSnapshot.value,
)

const draftStorageKey = computed(() => `${STORAGE_KEYS.editorDraft}:${formState.id || 'new'}`)

const confirmDialog = reactive<ConfirmDialogState>({
  visible: false,
  title: '',
  message: '',
  confirmButtonText: '确定',
  cancelButtonText: '取消',
  confirmButtonType: 'primary',
})

let confirmResolver:
  | {
    resolve: () => void
    reject: (reason?: unknown) => void
  }
  | null = null

const toolbarActions = [
  {
    label: 'H2',
    action: () => insertSnippet('\n## 小节标题\n'),
  },
  {
    label: '代码',
    action: () => insertSnippet('\n```ts\nconsole.log("hello world")\n```\n'),
  },
  {
    label: '引用',
    action: () => insertSnippet('\n> 在这里补充一条关键信息。\n'),
  },
  {
    label: '列表',
    action: () => insertSnippet('\n- 第一项\n- 第二项\n- 第三项\n'),
  },
]

const syncSnapshot = () => {
  initialSnapshot.value = currentSnapshot.value
}

const formatDraftTime = (value: string) =>
  new Date(value).toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
  })

const persistDraft = useDebounceFn(() => {
  if (!dialogVisible.value) {
    return
  }

  const payload: DraftPayload = {
    ...formState,
    savedAt: new Date().toISOString(),
  }

  setLocalStorage(draftStorageKey.value, payload)
  draftSavedAt.value = formatDraftTime(payload.savedAt)
}, 500)

const assignFormState = (payload: Partial<DocFormState>) => {
  Object.assign(formState, createInitialState(), payload)
}

const initializeEditor = async () => {
  await docsStore.fetchDocs()
}

const resetForm = () => {
  assignFormState({})
  draftSavedAt.value = ''
  editorMode.value = 'split'
}

const restoreDraft = (storageKey: string) => {
  const draft = getLocalStorage<DraftPayload | null>(storageKey, null)

  if (!draft) {
    return false
  }

  assignFormState({
    id: draft.id,
    title: draft.title,
    summary: draft.summary,
    tags: draft.tags,
    content: draft.content,
  })

  draftSavedAt.value = formatDraftTime(draft.savedAt)
  return true
}

const openCreateDialog = () => {
  resetForm()
  restoreDraft(`${STORAGE_KEYS.editorDraft}:new`)
  isEditMode.value = false
  dialogVisible.value = true
  syncSnapshot()
  void renderPreview(formState.content)
}

const openEditDialog = (docId: string) => {
  const target = docsStore.docs.find((item) => item.id === docId)

  if (!target) {
    return
  }

  const restored = restoreDraft(`${STORAGE_KEYS.editorDraft}:${docId}`)

  if (!restored) {
    assignFormState({
      id: target.id,
      title: target.title,
      summary: target.summary,
      tags: [...target.tags],
      content: target.content,
    })
    draftSavedAt.value = ''
  }

  isEditMode.value = true
  dialogVisible.value = true
  editorMode.value = 'split'
  syncSnapshot()
  void renderPreview(formState.content)
}

const insertSnippet = async (snippet: string) => {
  const textarea = markdownInputRef.value?.textarea

  if (!textarea) {
    formState.content += snippet
    return
  }

  const start = textarea.selectionStart ?? formState.content.length
  const end = textarea.selectionEnd ?? start

  formState.content = `${formState.content.slice(0, start)}${snippet}${formState.content.slice(end)}`

  await nextTick()
  textarea.focus()

  const cursor = start + snippet.length
  textarea.setSelectionRange(cursor, cursor)
}

const resetConfirmDialog = () => {
  confirmDialog.visible = false
  confirmDialog.title = ''
  confirmDialog.message = ''
  confirmDialog.confirmButtonText = '确定'
  confirmDialog.cancelButtonText = '取消'
  confirmDialog.confirmButtonType = 'primary'
}

const closeConfirmDialog = (confirmed: boolean) => {
  const resolver = confirmResolver
  confirmResolver = null
  resetConfirmDialog()

  if (!resolver) {
    return
  }

  if (confirmed) {
    resolver.resolve()
    return
  }

  resolver.reject(new Error('cancelled'))
}

const openEditorConfirm = (
  message: string,
  title: string,
  options: ConfirmDialogOptions = {},
) => {
  if (confirmResolver) {
    confirmResolver.reject(new Error('interrupted'))
    confirmResolver = null
  }

  confirmDialog.title = title
  confirmDialog.message = message
  confirmDialog.confirmButtonText = options.confirmButtonText ?? '确定'
  confirmDialog.cancelButtonText = options.cancelButtonText ?? '取消'
  confirmDialog.confirmButtonType = options.confirmButtonType ?? 'primary'
  confirmDialog.visible = true

  return new Promise<void>((resolve, reject) => {
    confirmResolver = { resolve, reject }
  })
}

const buildPayload = (): DocMutationPayload | null => {
  const tags = formState.tags.map((item) => item.trim()).filter(Boolean)

  if (!formState.title.trim() || !formState.content.trim()) {
    ElMessage.warning('标题和 Markdown 内容不能为空')
    return null
  }

  return {
    title: formState.title.trim(),
    summary: formState.summary.trim(),
    tags,
    content: formState.content,
  }
}

const handleSave = async () => {
  const payload = buildPayload()

  if (!payload) {
    return
  }

  const doc = await docsStore.saveDoc({
    id: isEditMode.value ? formState.id : undefined,
    ...payload,
  })

  removeLocalStorage(draftStorageKey.value)
  dialogVisible.value = false
  syncSnapshot()
  ElMessage.success(doc.id === formState.id && isEditMode.value ? '文档更新成功' : '文档创建成功')
}

const handleDelete = async (docId: string) => {
  await openEditorConfirm('删除后无法恢复，确定继续吗？', '删除确认', {
    confirmButtonText: '删除',
    cancelButtonText: '取消',
    confirmButtonType: 'danger',
  })

  await docsStore.deleteDoc(docId)
  removeLocalStorage(`${STORAGE_KEYS.editorDraft}:${docId}`)
  ElMessage.success('文档已删除')
}

const handleMockUpload = async (options: UploadRequestOptions) => {
  const url = URL.createObjectURL(options.file as Blob)
  formState.content += `\n\n![${options.file.name}](${url})\n`
  options.onSuccess?.({ url })
  ElMessage.success('图片已插入 Markdown 内容')
}

const handleDialogBeforeClose = async (done: () => void) => {
  if (!hasUnsavedChanges.value) {
    done()
    return
  }

  try {
    await openEditorConfirm('当前有未保存内容，仍要关闭吗？草稿会自动保存在本地。', '关闭确认', {
      confirmButtonText: '继续关闭',
      cancelButtonText: '再看一眼',
      confirmButtonType: 'warning',
    })
    done()
  } catch {
    return
  }
}

watch(
  formState,
  () => {
    persistDraft()

    if (dialogVisible.value && editorMode.value !== 'write') {
      void renderPreview(formState.content)
    }
  },
  { deep: true },
)

watch(editorMode, (mode) => {
  if (dialogVisible.value && mode !== 'write') {
    void renderPreview(formState.content)
  }
})

onMounted(initializeEditor)

onBeforeUnmount(() => {
  if (confirmResolver) {
    confirmResolver.reject(new Error('unmounted'))
    confirmResolver = null
  }
})
</script>

<template>
  <section class="editor-shell h-screen overflow-y-auto px-4 py-5 sm:px-8 sm:py-8">
    <div class="mb-8 flex flex-wrap items-center justify-between gap-4">
      <div>
        <p class="app-overline text-xs uppercase tracking-[0.32em]">内容管理</p>
        <h1 class="app-heading mt-3 text-2xl font-semibold sm:text-3xl">知识库管理后台</h1>
        <p class="app-caption mt-3 text-sm">
          在这里完成知识库文档的新增、编辑、删除，以及 Markdown 实时预览。
        </p>
      </div>

      <div class="flex flex-wrap gap-3">
        <el-button plain @click="docsStore.refreshDocs()">刷新文档</el-button>
        <el-button type="primary" @click="openCreateDialog">新增文档</el-button>
      </div>
    </div>

    <div class="mb-6 rounded-[1.5rem] border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-7 text-amber-800">
      当前为静态演示模式：文档新增、编辑、删除仅保存在当前浏览器，本机刷新后仍会保留，但不会同步到其他设备。
    </div>

    <div class="mb-6 grid gap-4 md:grid-cols-3">
      <div class="app-card rounded-[1.5rem] px-5 py-4">
        <p class="app-caption text-sm">文档数量</p>
        <p class="app-heading mt-3 text-3xl font-semibold">{{ docsStore.docs.length }}</p>
      </div>
      <div class="app-card rounded-[1.5rem] px-5 py-4">
        <p class="app-caption text-sm">当前文档</p>
        <p class="app-heading mt-3 text-lg font-semibold">
          {{ docsStore.currentDoc?.title ?? '暂无选中文档' }}
        </p>
      </div>
      <div class="app-card rounded-[1.5rem] px-5 py-4">
        <p class="app-caption text-sm">最近同步</p>
        <p class="app-heading mt-3 text-sm font-semibold">{{ syncLabel }}</p>
      </div>
    </div>

    <div class="app-panel-strong rounded-[1.75rem] p-4 sm:p-5">
      <div class="overflow-x-auto">
        <el-table :data="docsStore.docs" :loading="docsStore.loading" stripe style="min-width: 860px">
        <el-table-column prop="title" label="标题" min-width="220" />
        <el-table-column prop="summary" label="简介" min-width="280" show-overflow-tooltip />
        <el-table-column label="标签" min-width="220">
          <template #default="{ row }">
            <div class="flex flex-wrap gap-2">
              <el-tag v-for="tag in row.tags" :key="tag" effect="dark">{{ tag }}</el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" min-width="140" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <div class="flex gap-2">
              <el-button link type="primary" @click="openEditDialog(row.id)">编辑</el-button>
              <el-button link type="danger" @click="handleDelete(row.id)">删除</el-button>
            </div>
          </template>
        </el-table-column>
        </el-table>
      </div>
    </div>

    <el-dialog v-model="dialogVisible" append-to-body :title="isEditMode ? '编辑文档' : '新增文档'" width="92%" top="4vh"
      destroy-on-close :before-close="handleDialogBeforeClose">
      <div class="mb-6 grid gap-4 md:grid-cols-4">
        <div class="editor-detail-card rounded-2xl px-4 py-3">
          <p class="app-caption text-xs uppercase tracking-[0.18em]">字数</p>
          <p class="app-heading mt-2 text-2xl font-semibold">{{ stats.charCount }}</p>
        </div>
        <div class="editor-detail-card rounded-2xl px-4 py-3">
          <p class="app-caption text-xs uppercase tracking-[0.18em]">标题数</p>
          <p class="app-heading mt-2 text-2xl font-semibold">{{ stats.headingCount }}</p>
        </div>
        <div class="editor-detail-card rounded-2xl px-4 py-3">
          <p class="app-caption text-xs uppercase tracking-[0.18em]">预计阅读</p>
          <p class="app-heading mt-2 text-2xl font-semibold">{{ stats.estimatedMinutes }} 分钟</p>
        </div>
        <div class="editor-detail-card rounded-2xl px-4 py-3">
          <p class="app-caption text-xs uppercase tracking-[0.18em]">草稿</p>
          <p class="app-heading mt-2 text-sm font-semibold">
            {{ draftSavedAt ? `已自动保存于 ${draftSavedAt}` : '暂未生成本地草稿' }}
          </p>
        </div>
      </div>

      <div class="editor-toolbar mb-6 flex flex-wrap items-center justify-between gap-4 rounded-3xl px-4 py-3">
        <div class="flex flex-wrap gap-2">
          <el-button v-for="action in toolbarActions" :key="action.label" size="small" @click="action.action()">
            {{ action.label }}
          </el-button>
        </div>

        <el-radio-group v-model="editorMode" size="small" class="editor-mode-group">
          <el-radio-button label="write">仅编辑</el-radio-button>
          <el-radio-button label="split">分栏</el-radio-button>
          <el-radio-button label="preview">仅预览</el-radio-button>
        </el-radio-group>
      </div>

      <div class="grid gap-6" :class="editorMode === 'split' ? 'xl:grid-cols-[0.95fr_1.05fr]' : 'grid-cols-1'">
        <div v-show="editorMode !== 'preview'" class="space-y-5">
          <el-form label-position="top">
            <el-form-item label="标题">
              <el-input v-model="formState.title" placeholder="请输入文档标题" />
            </el-form-item>

            <el-form-item label="简介">
              <el-input v-model="formState.summary" type="textarea" :rows="3" placeholder="请输入文档简介" />
            </el-form-item>

            <el-form-item label="标签">
              <el-select v-model="formState.tags" multiple filterable allow-create default-first-option
                placeholder="输入标签后回车创建" />
            </el-form-item>

            <el-form-item label="插入图片（mock）">
              <el-upload :http-request="handleMockUpload" :show-file-list="false" accept="image/*">
                <el-button>上传并插入 Markdown</el-button>
              </el-upload>
            </el-form-item>

            <el-form-item label="Markdown 内容">
              <el-input ref="markdownInputRef" v-model="formState.content" type="textarea" :rows="14"
                placeholder="请输入 Markdown 内容" />
            </el-form-item>
          </el-form>
        </div>

        <div v-show="editorMode !== 'write'"
          class="editor-preview-panel flex h-[55vh] flex-col rounded-3xl p-4 shadow-inner sm:p-6 md:h-[70vh] xl:h-[100vh]">
          <div class="mb-4 flex items-center justify-between">
            <p class="app-caption text-sm font-semibold">实时预览</p>
            <el-tag :type="hasUnsavedChanges ? 'warning' : 'success'" effect="plain">
              {{ hasUnsavedChanges ? '存在未保存修改' : '内容已同步' }}
            </el-tag>
          </div>

          <el-skeleton v-if="previewLoading" :rows="12" animated />
          <div v-else class="markdown-body h-[97%] overflow-y-auto" v-html="previewContent" />
        </div>
      </div>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="docsStore.saving" @click="handleSave">保存文档</el-button>
      </template>
    </el-dialog>
  </section>

  <Teleport to="body">
    <div v-if="confirmDialog.visible" class="editor-confirm-overlay" aria-hidden="false">
      <div class="editor-confirm-panel" role="dialog" aria-modal="true" aria-labelledby="editor-confirm-title"
        aria-describedby="editor-confirm-message">
        <div class="editor-confirm-header">
          <h3 id="editor-confirm-title" class="editor-confirm-title">{{ confirmDialog.title }}</h3>
        </div>
        <div class="editor-confirm-content">
          <p id="editor-confirm-message" class="editor-confirm-message">{{ confirmDialog.message }}</p>
        </div>
        <div class="editor-confirm-actions">
          <el-button @click="closeConfirmDialog(false)">{{ confirmDialog.cancelButtonText }}</el-button>
          <el-button :type="confirmDialog.confirmButtonType" @click="closeConfirmDialog(true)">
            {{ confirmDialog.confirmButtonText }}
          </el-button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.editor-shell {
  color: var(--color-text);
}

.editor-detail-card {
  border: 1px solid var(--color-border);
  background: var(--color-surface-soft);
}

.editor-toolbar {
  border: 1px solid var(--color-border);
  background: var(--color-surface-soft);
}

.editor-mode-group :deep(.el-radio-button + .el-radio-button) {
  margin-left: 8px;
}

.editor-mode-group :deep(.el-radio-button:not(:first-child) .el-radio-button__inner) {
  border-left: 1px solid var(--el-border-color);
}

.editor-preview-panel {
  border: 1px solid rgba(148, 163, 184, 0.22);
  background: var(--color-article-bg);
  color: var(--color-article-text);
}

.editor-confirm-overlay {
  position: fixed;
  inset: 0;
  z-index: 3000;
  background: rgba(2, 6, 23, 0.62);
}

.editor-confirm-panel {
  position: fixed;
  top: 50%;
  left: 50%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: min(420px, calc(100vw - 32px));
  max-width: calc(100vw - 32px);
  transform: translate(-50%, -50%);
  overflow: hidden;
  border: 1px solid var(--color-border);
  border-radius: 1.5rem;
  background: var(--color-bg-secondary);
  color: var(--color-text);
  box-shadow: var(--shadow-panel);
}

.editor-confirm-header {
  padding: 24px 24px 0;
}

.editor-confirm-title {
  margin: 0;
  color: var(--color-text);
  font-size: 1.125rem;
  font-weight: 600;
  line-height: 1.4;
}

.editor-confirm-content {
  padding: 16px 24px 0;
}

.editor-confirm-message {
  margin: 0;
  color: var(--color-text-muted);
  line-height: 1.7;
}

.editor-confirm-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 24px;
}

.editor-confirm-actions :deep(.el-button) {
  margin: 0;
}
</style>
