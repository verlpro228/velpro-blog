import { ref } from 'vue'
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
let aiSummaryAbort: AbortController | null = null

export function useAiSummary() {
  async function generate(doc: Pick<KnowledgeDoc, 'id' | 'title' | 'content'>) {
    if (!doc.content.trim()) {
      return
    }

    const cached = aiSummaryCache.get(doc.id)

    if (cached) {
      aiSummary.value = cached
      aiSummaryState.value = 'done'
      return
    }

    aiSummaryAbort?.abort()
    aiSummaryAbort = new AbortController()
    aiSummary.value = ''
    aiSummaryError.value = ''
    aiSummaryState.value = 'loading'
    aiSummaryCollapsed.value = false

    try {
      await streamLongcatChatCompletion({
        signal: aiSummaryAbort.signal,
        messages: [
          {
            role: 'system',
            content:
              '你是技术文章阅读助手。请用中文把用户提供的文章总结为 3-5 条核心要点，每条以 "- " 开头单独一行，突出关键概念与结论，不要输出任何其他内容。',
          },
          {
            role: 'user',
            content: `请总结以下文章：\n\n标题：${doc.title}\n\n${doc.content}`,
          },
        ],
        onChunk(chunk) {
          aiSummary.value += chunk
        },
      })

      if (!aiSummary.value.trim()) {
        throw new Error('没有收到可显示的总结内容')
      }

      aiSummaryCache.set(doc.id, aiSummary.value)
      aiSummaryState.value = 'done'
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
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
    if (!aiSummary.value.trim()) {
      return
    }

    try {
      await navigator.clipboard.writeText(aiSummary.value)
    } catch {
      const textarea = document.createElement('textarea')
      textarea.value = aiSummary.value
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
