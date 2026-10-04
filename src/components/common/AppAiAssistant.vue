<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { streamLongcatChatCompletion } from '@/api/modules/ai'
import { STORAGE_KEYS } from '@/constants/app'
import { renderMarkdown } from '@/utils/markdownRenderer'
import { showToast } from '@/utils/toast'
import { useDraggableFab } from '@/hooks/useDraggableFab'
import { useDocsStore } from '@/store/modules/docs'
import type { AiChatMessage } from '@/types/ai'

interface AssistantMessage extends AiChatMessage {
  id: string
}

const WELCOME_MESSAGE = '你好，我是站点 AI 助手。你可以直接问我项目、前端、知识库或页面内容相关的问题。'

const route = useRoute()
const docsStore = useDocsStore()

const isVisible = ref(false)
const isStreaming = ref(false)
const draft = ref('')
const messageViewportRef = ref<HTMLElement | null>(null)
const messages = ref<AssistantMessage[]>([
  {
    id: 'assistant-welcome',
    role: 'assistant',
    content: WELCOME_MESSAGE,
  },
])

const enabled = import.meta.env.VITE_ENABLE_AI_ASSISTANT !== 'false'

// 悬浮球可拖拽：位置记忆 + 左右磁吸停靠；提示气泡随停靠方向自动换边
const assistantEl = ref<HTMLElement | null>(null)
const {
  side: assistantSide,
  dragging: assistantDragging,
  style: assistantStyle,
  onPointerDown: onAssistantPointerDown,
  onClickCapture: onAssistantClickCapture,
} = useDraggableFab(
  { storageKey: STORAGE_KEYS.aiAssistantPos, defaultAnchor: { right: 24, bottom: 28 } },
  assistantEl,
)

const baseSystemMessage: AiChatMessage = {
  role: 'system',
  content:
    'You are the Velpro Blog front-end AI assistant. Keep responses concise, useful, and friendly. Prefer Chinese unless the user asks otherwise.',
}

// 边读边问：知识库页正在阅读的文章自动注入对话上下文（只在文章全文已加载时生效）
const articleContextMessage = computed<AiChatMessage | null>(() => {
  const doc = docsStore.currentDoc

  // 用路由名而非 path 判断：文章页是 /knowledge/doc-xxx，path 不再等于 '/knowledge'
  if (route.name !== 'knowledge' || !doc?.content?.trim()) {
    return null
  }

  return {
    role: 'system',
    content: `用户当前正在阅读知识库文章《${doc.title}》，正文如下：\n\n${doc.content}\n\n请优先结合这篇文章的内容回答用户的问题；若问题与文章无关，则按通用助手回答。`,
  }
})

let previousBodyOverflow = ''
let abortController: AbortController | null = null
let scrollFrame = 0

const canSend = computed(() => Boolean(draft.value.trim()) && !isStreaming.value)

const visibleMessages = computed(() =>
  messages.value.map((message) => ({
    ...message,
    html: renderMarkdown(message.content || ''),
  })),
)

const createMessageId = (role: AiChatMessage['role']) => `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

const findMessageIndex = (messageId: string) => messages.value.findIndex((message) => message.id === messageId)

const getMessageContent = (messageId: string) => {
  const index = findMessageIndex(messageId)
  return index === -1 ? '' : messages.value[index].content
}

const replaceMessageContent = (messageId: string, content: string) => {
  const index = findMessageIndex(messageId)

  if (index === -1) {
    return
  }

  const current = messages.value[index]
  messages.value.splice(index, 1, {
    ...current,
    content,
  })
}

const appendMessageContent = (messageId: string, chunk: string) => {
  const index = findMessageIndex(messageId)

  if (index === -1) {
    return
  }

  const current = messages.value[index]
  messages.value.splice(index, 1, {
    ...current,
    content: `${current.content}${chunk}`,
  })
}

const scheduleScrollToBottom = () => {
  if (scrollFrame) {
    cancelAnimationFrame(scrollFrame)
  }

  scrollFrame = requestAnimationFrame(() => {
    const viewport = messageViewportRef.value

    if (viewport) {
      viewport.scrollTop = viewport.scrollHeight
    }

    scrollFrame = 0
  })
}

const openAssistant = () => {
  isVisible.value = true
}

const stopStreaming = () => {
  abortController?.abort()
  abortController = null
}

const resetConversation = () => {
  stopStreaming()
  isStreaming.value = false
  messages.value = [
    {
      id: 'assistant-welcome',
      role: 'assistant',
      content: WELCOME_MESSAGE,
    },
  ]
  scheduleScrollToBottom()
}

const closeAssistant = () => {
  stopStreaming()
  isStreaming.value = false
  isVisible.value = false
}

const handleComposerKeydown = (event: KeyboardEvent) => {
  if (event.key !== 'Enter' || event.shiftKey) {
    return
  }

  event.preventDefault()

  if (canSend.value) {
    void submitMessage()
  }
}

async function submitMessage() {
  if (!canSend.value) {
    return
  }

  const content = draft.value.trim()
  draft.value = ''

  const userMessage: AssistantMessage = {
    id: createMessageId('user'),
    role: 'user',
    content,
  }

  const assistantMessage: AssistantMessage = {
    id: createMessageId('assistant'),
    role: 'assistant',
    content: '',
  }

  const requestMessages: AiChatMessage[] = [
    baseSystemMessage,
    ...(articleContextMessage.value ? [articleContextMessage.value] : []),
    ...messages.value.map(({ role, content: currentContent }) => ({
      role,
      content: currentContent,
    })),
    {
      role: userMessage.role,
      content: userMessage.content,
    },
  ]

  messages.value = [...messages.value, userMessage, assistantMessage]
  scheduleScrollToBottom()

  abortController = new AbortController()
  isStreaming.value = true

  try {
    await streamLongcatChatCompletion({
      messages: requestMessages,
      signal: abortController.signal,
      onChunk(chunk) {
        appendMessageContent(assistantMessage.id, chunk)
        scheduleScrollToBottom()
      },
    })

    if (!getMessageContent(assistantMessage.id).trim()) {
      replaceMessageContent(assistantMessage.id, '当前没有收到可显示的回复内容。')
    }
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      if (!getMessageContent(assistantMessage.id).trim()) {
        replaceMessageContent(assistantMessage.id, '本次回复已停止。')
      }

      return
    }

    const fallbackMessage = error instanceof Error ? error.message : 'AI 请求失败，请稍后重试。'
    const currentContent = getMessageContent(assistantMessage.id).trim()

    replaceMessageContent(
      assistantMessage.id,
      currentContent
        ? `${currentContent}\n\n> 请求中断：${fallbackMessage}`
        : `请求失败：${fallbackMessage}`,
    )

    showToast('AI 请求失败，请检查 Longcat 配置或网络。', { type: 'error' })
  } finally {
    isStreaming.value = false
    abortController = null
    await nextTick()
    scheduleScrollToBottom()
  }
}

watch(
  isVisible,
  async (visible) => {
    if (typeof document === 'undefined') {
      return
    }

    if (visible) {
      previousBodyOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      await nextTick()
      scheduleScrollToBottom()
      return
    }

    document.body.style.overflow = previousBodyOverflow
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  stopStreaming()

  if (typeof document !== 'undefined') {
    document.body.style.overflow = previousBodyOverflow
  }

  if (scrollFrame) {
    cancelAnimationFrame(scrollFrame)
  }
})
</script>

<template>
  <div
    v-if="enabled"
    ref="assistantEl"
    class="ai-assistant"
    :class="[`is-${assistantSide}`, { 'is-dragging': assistantDragging }]"
    :style="assistantStyle"
    @click.capture="onAssistantClickCapture"
  >
    <div v-if="!isVisible" class="ai-assistant__prompt-bubble" aria-hidden="true">
      点击询问AI小助，
      <br />
      为你解答疑惑！
    </div>

    <button
      class="ai-assistant__trigger"
      type="button"
      aria-label="Open AI assistant"
      title="AI 助手（按住可拖动到屏幕两侧）"
      @click="openAssistant"
      @pointerdown="onAssistantPointerDown"
    >
      <span class="ai-assistant__trigger-core">
        <span class="ai-assistant__trigger-eye" />
        <span class="ai-assistant__trigger-eye" />
      </span>
      <span class="ai-assistant__trigger-label">ROBOT</span>
    </button>

    <Teleport to="body">
      <Transition name="ai-assistant-fade">
        <div v-if="isVisible" class="ai-assistant__overlay" @click.self="closeAssistant">
          <Transition name="ai-assistant-panel">
            <section
              v-if="isVisible"
              class="ai-assistant__panel"
              role="dialog"
              aria-modal="true"
              aria-labelledby="ai-assistant-title"
            >
              <header class="ai-assistant__header">
                <div>
                  <h2 id="ai-assistant-title" class="ai-assistant__title">Blog Robot</h2>
                </div>

                <div class="ai-assistant__header-actions">
                  <button class="ai-assistant__icon-button" type="button" aria-label="Reset chat" @click="resetConversation">
                    新对话
                  </button>
                  <button class="ai-assistant__icon-button" type="button" aria-label="Close AI assistant" @click="closeAssistant">
                    关闭
                  </button>
                </div>
              </header>

              <div v-if="articleContextMessage" class="ai-assistant__article-context" role="status">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
                <span>已关联当前文章《{{ docsStore.currentDoc?.title }}》，可直接就内容提问</span>
              </div>

              <section ref="messageViewportRef" class="ai-assistant__messages">
                <article
                  v-for="message in visibleMessages"
                  :key="message.id"
                  class="ai-assistant__message"
                  :class="`is-${message.role}`"
                >
                  <p class="ai-assistant__message-label">{{ message.role === 'user' ? 'You' : 'Robot' }}</p>
                  <div
                    class="ai-assistant__bubble"
                    :class="{ 'is-thinking': message.role === 'assistant' && isStreaming && !message.content.trim() }"
                  >
                    <div
                      v-if="message.role === 'assistant' && isStreaming && !message.content.trim()"
                      class="ai-assistant__thinking"
                      aria-label="AI is thinking"
                    >
                      <span class="ai-assistant__thinking-dot" />
                      <span class="ai-assistant__thinking-dot" />
                      <span class="ai-assistant__thinking-dot" />
                    </div>
                    <div v-else class="markdown-body ai-assistant__markdown" v-html="message.html" />
                  </div>
                </article>
              </section>

              <footer class="ai-assistant__footer">
                <div class="ai-assistant__composer-shell">
                  <textarea
                    v-model="draft"
                    class="ai-assistant__composer"
                    rows="3"
                    placeholder="输入你的问题，Enter 发送，Shift + Enter 换行"
                    :disabled="isStreaming"
                    @keydown="handleComposerKeydown"
                  />
                </div>

                <div class="ai-assistant__footer-actions">
                  <div class="ai-assistant__action-group">
                    <button
                      v-if="isStreaming"
                      class="ai-assistant__secondary-button"
                      type="button"
                      @click="stopStreaming"
                    >
                      Stop
                    </button>
                    <button
                      class="ai-assistant__primary-button"
                      type="button"
                      :disabled="!canSend"
                      @click="submitMessage"
                    >
                      发送
                    </button>
                  </div>
                </div>
              </footer>
            </section>
          </Transition>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
/* 拖拽定位容器：位置（left/top）由 useDraggableFab 内联注入，气泡与按钮都跟随它移动 */
.ai-assistant {
  position: fixed;
  /* 高于导航栏(z-50)与页面内容，避免拖到顶部后被遮挡、无法再抓取 */
  z-index: 88;
  width: 64px;
  height: 64px;
  touch-action: none;
  user-select: none;
  -webkit-user-select: none;
}

.ai-assistant.is-dragging {
  z-index: 94;
  cursor: grabbing;
}

.ai-assistant__prompt-bubble {
  position: absolute;
  right: 0;
  bottom: calc(100% + 6px);
  min-width: 188px;
  max-width: 228px;
  padding: 12px 14px;
  border: 1px solid rgba(255, 255, 255, 0.62);
  border-radius: 18px;
  /* 液态玻璃：半透明渐变底 + 背景模糊提饱和 + 顶部内高光 */
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.78), rgba(255, 255, 255, 0.5));
  box-shadow:
    0 18px 38px rgba(23, 84, 156, 0.16),
    0 4px 10px rgba(23, 84, 156, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(20px) saturate(160%);
  -webkit-backdrop-filter: blur(20px) saturate(160%);
  color: rgba(15, 34, 56, 0.92);
  font-size: 13px;
  font-weight: 600;
  line-height: 1.55;
  letter-spacing: 0.01em;
  pointer-events: none;
  user-select: none;
  text-align: left;
  animation: ai-prompt-float 4.6s ease-in-out infinite;
}

/* 深色模式：深蓝玻璃底，保持同款模糊与高光结构 */
:root.theme-dark .ai-assistant__prompt-bubble {
  border-color: rgba(148, 197, 255, 0.18);
  background: linear-gradient(135deg, rgba(46, 64, 98, 0.68), rgba(16, 26, 46, 0.58));
  box-shadow:
    0 18px 38px rgba(2, 6, 23, 0.5),
    0 4px 10px rgba(2, 6, 23, 0.32),
    inset 0 1px 0 rgba(255, 255, 255, 0.12);
  color: rgba(226, 238, 255, 0.95);
}

/* 停靠到左侧时气泡换边，避免伸出屏幕 */
.ai-assistant.is-left .ai-assistant__prompt-bubble {
  right: auto;
  left: 0;
}

/* 无尾巴：气泡悬浮于球体上方即可 */

/* 左侧停靠时小尾巴同步换到左下角 */
.ai-assistant.is-left .ai-assistant__prompt-bubble::after {
  right: auto;
  left: 28px;
}

.ai-assistant__trigger {
  position: relative;
  z-index: 1;
  display: inline-flex;
  height: 100%;
  width: 100%;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 999px;
  /* 参考图样式：明亮经典蓝机器人球，顶部高光 + 底部加深，无赛博感描边 */
  background:
    radial-gradient(circle at 50% 20%, rgba(255, 255, 255, 0.42), rgba(255, 255, 255, 0) 32%),
    linear-gradient(180deg, #58aef0 0%, #2b7bd0 52%, #1d5fa8 100%);
  box-shadow:
    0 14px 26px rgba(23, 84, 156, 0.32),
    0 4px 10px rgba(23, 84, 156, 0.2),
    inset 0 -10px 16px rgba(12, 56, 110, 0.32),
    inset 0 3px 6px rgba(255, 255, 255, 0.26);
  color: #ffffff;
  cursor: grab;
  overflow: hidden;
  transition:
    transform 0.28s ease,
    box-shadow 0.28s ease,
    border-color 0.28s ease;
  animation: ai-robot-bob 3.2s ease-in-out infinite;
}

.ai-assistant__trigger:hover {
  animation-play-state: paused;
  transform: translateY(-5px) scale(1.04);
  box-shadow:
    0 22px 40px rgba(23, 84, 156, 0.36),
    0 8px 16px rgba(23, 84, 156, 0.22),
    inset 0 -12px 18px rgba(12, 56, 110, 0.34),
    inset 0 3px 6px rgba(255, 255, 255, 0.3);
}

/* 拖拽中：抓取光标、停掉浮动动画与悬停位移，避免视觉抖动 */
.ai-assistant.is-dragging .ai-assistant__trigger {
  cursor: grabbing;
  animation-play-state: paused;
  transform: none;
}

.ai-assistant__trigger-core {
  position: relative;
  display: grid;
  grid-template-columns: repeat(2, 9px);
  gap: 15px;
  z-index: 2;
  transform: translateY(-9px);
}

.ai-assistant__trigger-eye {
  height: 9px;
  width: 9px;
  border-radius: 999px;
  background: #ffffff;
}

.ai-assistant__trigger-label {
  position: absolute;
  bottom: 13px;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  z-index: 2;
  color: #ffffff;
}

.ai-assistant__overlay {
  position: fixed;
  inset: 0;
  /* 必须高于悬浮球本体(88/94)，保证对话面板打开时盖住悬浮球 */
  z-index: 96;
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
  padding: 24px;
  background: rgba(2, 6, 23, 0.42);
  backdrop-filter: blur(10px);
}

.ai-assistant__panel {
  display: flex;
  height: min(760px, calc(100vh - 48px));
  width: min(440px, calc(100vw - 48px));
  flex-direction: column;
  border: 1px solid var(--color-border);
  border-radius: 32px;
  background:
    radial-gradient(circle at top right, rgba(34, 211, 238, 0.16), transparent 34%),
    linear-gradient(180deg, rgba(14, 22, 42, 0.992), rgba(6, 12, 26, 0.995));
  box-shadow: 0 34px 80px rgba(2, 6, 23, 0.38);
  overflow: hidden;
  color: #e8f1ff;
  font-family: 'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', 'Helvetica Neue', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
}

.ai-assistant__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 22px 22px 18px;
}

.ai-assistant__title {
  margin: 0;
  color: #f8fafc;
  font-size: 1.9rem;
  font-weight: 800;
  letter-spacing: -0.03em;
}

.ai-assistant__header-actions,
.ai-assistant__action-group {
  display: flex;
  gap: 10px;
}

.ai-assistant__icon-button,
.ai-assistant__secondary-button,
.ai-assistant__primary-button {
  border-radius: 999px;
  border: 1px solid var(--color-border-strong);
  cursor: pointer;
  font-weight: 700;
  transition:
    transform 0.24s ease,
    border-color 0.24s ease,
    background-color 0.24s ease,
    opacity 0.24s ease;
}

.ai-assistant__icon-button:hover,
.ai-assistant__secondary-button:hover,
.ai-assistant__primary-button:hover {
  transform: translateY(-1px);
}

.ai-assistant__icon-button {
  min-width: 70px;
  padding: 0.7rem 0.95rem;
  background: rgba(255, 255, 255, 0.065);
  color: #d9e7ff;
}

.ai-assistant__messages {
  flex: 1;
  overflow-y: auto;
  padding: 6px 22px 18px;
  scrollbar-width: thin;
  scrollbar-color: rgba(148, 163, 184, 0.45) transparent;
}

.ai-assistant__messages::-webkit-scrollbar {
  width: 7px;
}

.ai-assistant__messages::-webkit-scrollbar-thumb {
  border-radius: 999px;
  background: rgba(148, 163, 184, 0.45);
}

.ai-assistant__message + .ai-assistant__message,
.ai-assistant__config-card {
  margin-top: 16px;
}

.ai-assistant__message.is-user {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.ai-assistant__message-label {
  margin: 0 0 6px;
  color: #8faecc;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.ai-assistant__bubble {
  width: min(100%, 340px);
  border: 1px solid rgba(148, 163, 184, 0.22);
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.06);
  padding: 15px 17px;
  backdrop-filter: blur(10px);
}

.ai-assistant__bubble.is-thinking {
  display: flex;
  align-items: center;
  min-height: 66px;
}

.ai-assistant__message.is-user .ai-assistant__bubble {
  border-color: rgba(34, 211, 238, 0.22);
  background: linear-gradient(135deg, rgba(16, 116, 148, 0.5), rgba(11, 56, 87, 0.66));
}

.ai-assistant__thinking {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.ai-assistant__thinking-dot {
  height: 10px;
  width: 10px;
  border-radius: 999px;
  background: rgba(220, 232, 250, 0.9);
  box-shadow: 0 0 12px rgba(34, 211, 238, 0.18);
  animation: ai-thinking-wave 1.15s ease-in-out infinite;
}

.ai-assistant__thinking-dot:nth-child(2) {
  animation-delay: 0.16s;
}

.ai-assistant__thinking-dot:nth-child(3) {
  animation-delay: 0.32s;
}

.ai-assistant__markdown {
  color: #e2ecff;
  font-size: 1rem;
  font-weight: 500;
  line-height: 1.95;
  letter-spacing: 0.01em;
  word-break: break-word;
}

.ai-assistant__message.is-user .ai-assistant__markdown {
  color: #effbff;
}

.ai-assistant__markdown :deep(> *:first-child) {
  margin-top: 0;
}

.ai-assistant__markdown :deep(> *:last-child) {
  margin-bottom: 0;
}

.ai-assistant__markdown :deep(h1),
.ai-assistant__markdown :deep(h2),
.ai-assistant__markdown :deep(h3),
.ai-assistant__markdown :deep(h4) {
  color: #f8fafc;
}

.ai-assistant__markdown :deep(p),
.ai-assistant__markdown :deep(ul),
.ai-assistant__markdown :deep(ol) {
  margin: 0.75em 0;
}

.ai-assistant__markdown :deep(pre) {
  margin: 0.9rem 0;
  border: 1px solid rgba(148, 163, 184, 0.16);
  background: rgba(2, 6, 23, 0.5);
}

.ai-assistant__markdown :deep(code:not(pre code)) {
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.06);
  padding: 0.12rem 0.34rem;
}

.ai-assistant__markdown :deep(blockquote) {
  background: rgba(255, 255, 255, 0.04);
  color: #dbe6fb;
}

.ai-assistant__config-card {
  border: 1px dashed rgba(245, 158, 11, 0.4);
  border-radius: 22px;
  background: rgba(245, 158, 11, 0.1);
  padding: 16px;
}

.ai-assistant__config-title {
  margin: 0;
  color: #fef3c7;
  font-weight: 700;
}

.ai-assistant__config-copy {
  margin: 10px 0 0;
  color: #fde68a;
  font-size: 0.92rem;
  line-height: 1.7;
}

.ai-assistant__config-code {
  margin: 12px 0 0;
  overflow-x: auto;
  border-radius: 14px;
  background: rgba(2, 6, 23, 0.45);
  padding: 12px 14px;
  color: #f8fafc;
  font-size: 0.84rem;
}

.ai-assistant__footer {
  border-top: 1px solid rgba(148, 163, 184, 0.16);
  padding: 16px 22px 22px;
  background: rgba(2, 6, 23, 0.2);
}

.ai-assistant__composer-shell {
  border: 1px solid rgba(148, 163, 184, 0.24);
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.055);
  padding: 12px 14px;
}

.ai-assistant__composer {
  display: block;
  min-height: 84px;
  width: 100%;
  resize: none;
  border: 0;
  background: transparent;
  color: #f8fbff;
  font-size: 1.02rem;
  font-weight: 500;
  line-height: 1.85;
  letter-spacing: 0.01em;
  outline: none;
}

.ai-assistant__composer::placeholder {
  color: #9ab0cd;
  opacity: 1;
}

.ai-assistant__composer:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

.ai-assistant__footer-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 14px;
}

.ai-assistant__secondary-button,
.ai-assistant__primary-button {
  min-width: 86px;
  padding: 0.78rem 1.15rem;
}

.ai-assistant__secondary-button {
  background: rgba(255, 255, 255, 0.065);
  color: #dce8fa;
}

.ai-assistant__primary-button {
  border-color: rgba(34, 211, 238, 0.26);
  background: linear-gradient(135deg, rgba(34, 211, 238, 0.96), rgba(8, 145, 178, 0.96));
  color: #06273b;
  font-size: 1rem;
  font-weight: 800;
}

.ai-assistant__primary-button:disabled,
.ai-assistant__secondary-button:disabled {
  cursor: not-allowed;
  opacity: 0.45;
  transform: none;
}

.ai-assistant-fade-enter-active,
.ai-assistant-fade-leave-active {
  transition: opacity 0.26s ease;
}

.ai-assistant-fade-enter-from,
.ai-assistant-fade-leave-to {
  opacity: 0;
}

.ai-assistant-panel-enter-active,
.ai-assistant-panel-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.ai-assistant-panel-enter-from,
.ai-assistant-panel-leave-to {
  opacity: 0;
  transform: translateY(24px) scale(0.98);
}

@keyframes ai-thinking-wave {
  0%,
  80%,
  100% {
    transform: translateY(0) scale(0.9);
    opacity: 0.42;
  }

  40% {
    transform: translateY(-4px) scale(1);
    opacity: 1;
  }
}

@keyframes ai-robot-bob {
  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-5px);
  }
}

@keyframes ai-prompt-float {
  0%,
  100% {
    transform: translateY(0);
    box-shadow:
      0 18px 38px rgba(3, 17, 36, 0.16),
      inset 0 1px 0 rgba(255, 255, 255, 0.14);
  }

  50% {
    transform: translateY(-3px);
    box-shadow:
      0 22px 42px rgba(3, 17, 36, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.16);
  }
}

@media (max-width: 767px) {
  .ai-assistant {
    width: 58px;
    height: 58px;
  }

  /* 移动端屏幕小，提示气泡会遮挡导航/列表内容，只保留 ROBOT 球体 */
  .ai-assistant__prompt-bubble {
    display: none;
  }

  .ai-assistant__prompt-bubble {
    min-width: 164px;
    max-width: 196px;
    padding: 10px 12px;
    font-size: 12px;
  }

  .ai-assistant__prompt-bubble::after {
    right: 24px;
  }

  .ai-assistant.is-left .ai-assistant__prompt-bubble::after {
    right: auto;
    left: 24px;
  }

  .ai-assistant__overlay {
    padding: 12px;
  }

  .ai-assistant__panel {
    height: min(82vh, 780px);
    width: 100%;
    border-radius: 28px;
  }

  .ai-assistant__header,
  .ai-assistant__messages,
  .ai-assistant__footer {
    padding-left: 16px;
    padding-right: 16px;
  }

  .ai-assistant__header {
    padding-top: 18px;
  }

  .ai-assistant__footer-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .ai-assistant__action-group {
    justify-content: flex-end;
  }
}


/* 边读边问：当前文章关联提示条 */
.ai-assistant__article-context {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 16px 10px;
  padding: 8px 12px;
  border: 1px solid rgba(34, 211, 238, 0.28);
  border-radius: 12px;
  background: rgba(8, 145, 178, 0.1);
  color: #0e7490;
  font-size: 12px;
  line-height: 1.5;
}

.ai-assistant__article-context svg {
  width: 14px;
  height: 14px;
  flex: none;
}

.ai-assistant__article-context span {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

:root.theme-dark .ai-assistant__article-context {
  border-color: rgba(34, 211, 238, 0.25);
  background: rgba(34, 211, 238, 0.08);
  color: #67e8f9;
}

/* ===== 浅色模式：对话面板整体转浅色（上方深色样式为默认，保持不变） ===== */
:root.theme-light .ai-assistant__panel {
  border-color: rgba(148, 163, 184, 0.35);
  background:
    radial-gradient(circle at top right, rgba(34, 211, 238, 0.1), transparent 34%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.985), rgba(240, 247, 255, 0.99));
  box-shadow: 0 34px 80px rgba(15, 42, 80, 0.18);
  color: #1e293b;
}

:root.theme-light .ai-assistant__title {
  color: #0f172a;
}

:root.theme-light .ai-assistant__icon-button,
:root.theme-light .ai-assistant__secondary-button {
  border-color: rgba(148, 163, 184, 0.45);
  background: rgba(15, 23, 42, 0.045);
  color: #334155;
}

:root.theme-light .ai-assistant__message-label {
  color: #64748b;
}

:root.theme-light .ai-assistant__bubble {
  border-color: rgba(148, 163, 184, 0.32);
  background: rgba(15, 23, 42, 0.045);
}

:root.theme-light .ai-assistant__message.is-user .ai-assistant__bubble {
  border-color: rgba(8, 145, 178, 0.32);
  background: linear-gradient(135deg, rgba(165, 233, 240, 0.55), rgba(186, 230, 253, 0.62));
}

:root.theme-light .ai-assistant__markdown {
  color: #1e293b;
}

:root.theme-light .ai-assistant__message.is-user .ai-assistant__markdown {
  color: #0c4a5e;
}

:root.theme-light .ai-assistant__markdown :deep(h1),
:root.theme-light .ai-assistant__markdown :deep(h2),
:root.theme-light .ai-assistant__markdown :deep(h3),
:root.theme-light .ai-assistant__markdown :deep(h4) {
  color: #0f172a;
}

/* 行内代码浅底深字；代码块保留深色语法高亮底，与全站 markdown 惯例一致 */
:root.theme-light .ai-assistant__markdown :deep(code:not(pre code)) {
  border-color: rgba(148, 163, 184, 0.35);
  background: rgba(15, 23, 42, 0.06);
}

:root.theme-light .ai-assistant__markdown :deep(blockquote) {
  background: rgba(15, 23, 42, 0.04);
  color: #475569;
}

:root.theme-light .ai-assistant__config-title {
  color: #92400e;
}

:root.theme-light .ai-assistant__config-copy {
  color: #a16207;
}

:root.theme-light .ai-assistant__thinking-dot {
  background: rgba(71, 85, 105, 0.75);
  box-shadow: 0 0 12px rgba(8, 145, 178, 0.2);
}

:root.theme-light .ai-assistant__footer {
  border-color: rgba(148, 163, 184, 0.28);
  background: rgba(241, 247, 255, 0.75);
}

:root.theme-light .ai-assistant__composer-shell {
  border-color: rgba(148, 163, 184, 0.42);
  background: #ffffff;
}

:root.theme-light .ai-assistant__composer {
  color: #0f172a;
}

:root.theme-light .ai-assistant__composer::placeholder {
  color: #94a3b8;
}
</style>
