import { computed, ref } from 'vue'
import { streamLongcatChatCompletion } from '@/api/modules/ai'
import type { KnowledgeDoc } from '@/types/content'

export type AiSummaryState = 'idle' | 'loading' | 'done' | 'error'

// 模块级单例状态：文章页摘要卡与右上角 AI 总结胶囊共享同一份数据与缓存
const aiSummary = ref('')
const aiSummaryState = ref<AiSummaryState>('idle')
const aiSummaryError = ref('')
// 收起=折叠而非销毁：保留已生成的摘要，随时可再次展开
const aiSummaryCollapsed = ref(false)
const aiSummaryCache = new Map<string, string>()
// 当前这份 aiSummary 属于哪篇文档：切换文档后，旧请求的收尾与增量都据此丢弃，避免串台
const aiSummaryDocId = ref('')
let aiSummaryAbort: AbortController | null = null

// 模型偶尔仍会输出 Markdown 标记，摘要卡是纯文本渲染，这里统一抹平成普通文字
const MARKDOWN_MARKS: Array<[RegExp, string]> = [
  [/\*\*(.+?)\*\*/g, '$1'], // **加粗**
  [/__(.+?)__/g, '$1'], // __加粗__
  [/`([^`\n]+)`/g, '$1'], // `行内代码`
  [/^#{1,6}\s+/gm, ''], // ### 标题
  [/(^|\s)\*([^*\s](?:[^*\n]*[^*\s])?)\*/g, '$1$2'], // *斜体*（要求首尾非空白，避免误伤 "a * b * c"）
]

function toPlainText(text: string): string {
  return MARKDOWN_MARKS.reduce((acc, [pattern, replacement]) => acc.replace(pattern, replacement), text)
}

// 展示与复制都用抹平后的文本；缓存仍存原始内容，便于后续需要时切换渲染方式
const aiSummaryText = computed(() => toPlainText(aiSummary.value))

export function useAiSummary() {
  async function generate(doc: Pick<KnowledgeDoc, 'id' | 'title' | 'content'>) {
    if (!doc.content.trim()) {
      return
    }

    const cached = aiSummaryCache.get(doc.id)

    if (cached) {
      aiSummary.value = cached
      aiSummaryDocId.value = doc.id
      aiSummaryState.value = 'done'
      return
    }

    // 每次生成都换新 controller：切换文档后旧请求靠它判断自己已经过期
    const controller = new AbortController()
    aiSummaryAbort?.abort()
    aiSummaryAbort = controller

    aiSummary.value = ''
    aiSummaryDocId.value = doc.id
    aiSummaryError.value = ''
    aiSummaryState.value = 'loading'
    aiSummaryCollapsed.value = false

    // 局部累积流式内容：即使中途被切走，也能把完整结果写回它自己的缓存
    let buffer = ''

    try {
      await streamLongcatChatCompletion({
        signal: controller.signal,
        messages: [
          {
            role: 'system',
            content:
              '你是技术文章阅读助手。请用中文把用户提供的文章总结为 3-5 条核心要点，每条以 "- " 开头单独一行，突出关键概念与结论。不要使用任何 Markdown 标记（如 **、`、#），直接输出纯文本，不要输出其他内容。',
          },
          {
            role: 'user',
            content: `请总结以下文章：\n\n标题：${doc.title}\n\n${doc.content}`,
          },
        ],
        onChunk(chunk) {
          buffer += chunk

          // 已经切到别的文档：不再往当前卡片追加这篇的内容
          if (!controller.signal.aborted && aiSummaryDocId.value === doc.id) {
            aiSummary.value = buffer
          }
        },
      })

      if (!buffer.trim()) {
        throw new Error('没有收到可显示的总结内容')
      }

      aiSummaryCache.set(doc.id, buffer)

      // 结果属于已经离开的文档：只进缓存，不回写当前展示状态
      if (controller.signal.aborted || aiSummaryDocId.value !== doc.id) {
        return
      }

      aiSummary.value = buffer
      aiSummaryState.value = 'done'
    } catch (error) {
      if (controller.signal.aborted) {
        return
      }

      if (error instanceof DOMException && error.name === 'AbortError') {
        return
      }

      // 报错也要确认仍是这篇文档：否则会把错误提示挂到别的文章上
      if (aiSummaryDocId.value !== doc.id) {
        return
      }

      aiSummaryError.value = error instanceof Error ? error.message : '生成失败，请稍后重试'
      aiSummaryState.value = 'error'
    }
  }

  function dismiss() {
    // 收起摘要卡（不销毁内容、不打断后台生成），可随时再展开
    aiSummaryCollapsed.value = true
  }

  function expand() {
    aiSummaryCollapsed.value = false
  }

  function refresh(doc: Pick<KnowledgeDoc, 'id' | 'title' | 'content'>) {
    aiSummaryCache.delete(doc.id)
    aiSummaryCollapsed.value = false
    void generate(doc)
  }

  // 切换文档时调用：终止进行中的请求，恢复目标文档的已有摘要（无则回到 idle）
  function restoreFor(docId: string | undefined) {
    aiSummaryAbort?.abort()
    aiSummaryCollapsed.value = false
    // 先绑定归属文档，再决定是否有可复用的缓存
    aiSummaryDocId.value = docId ?? ''
    const cached = docId ? aiSummaryCache.get(docId) : undefined

    if (cached) {
      aiSummary.value = cached
      aiSummaryState.value = 'done'
    } else {
      aiSummary.value = ''
      aiSummaryError.value = ''
      aiSummaryState.value = 'idle'
    }
  }

  async function copySummary() {
    if (!aiSummaryText.value.trim()) {
      return
    }

    try {
      await navigator.clipboard.writeText(aiSummaryText.value)
    } catch {
      const textarea = document.createElement('textarea')
      textarea.value = aiSummaryText.value
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      textarea.remove()
    }
  }

  return {
    aiSummary,
    aiSummaryText,
    aiSummaryDocId,
    aiSummaryState,
    aiSummaryError,
    aiSummaryCollapsed,
    generate,
    dismiss,
    expand,
    refresh,
    restoreFor,
    copySummary,
  }
}
