<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { streamLongcatChatCompletion } from '@/api/modules/ai'
import { renderMarkdown } from '@/utils/markdownRenderer'
import { showToast } from '@/utils/toast'
import type { AiChatMessage } from '@/types/ai'

interface AssistantMessage extends AiChatMessage {
  id: string
}

const WELCOME_MESSAGE = '你好，我是站点 AI 助手。你可以直接问我项目、前端、知识库或页面内容相关的问题。'

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

const baseSystemMessage: AiChatMessage = {
  role: 'system',
  content:
    'You are the Velpro Blog front-end AI assistant. Keep responses concise, useful, and friendly. Prefer Chinese unless the user asks otherwise.',
}

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
  <div v-if="enabled" class="ai-assistant">
    <div v-if="!isVisible" class="ai-assistant__prompt-bubble" aria-hidden="true">
      点击询问AI小助，
      <br />
      为你解答疑惑！
    </div>

    <button
      class="ai-assistant__trigger"
      type="button"
      aria-label="Open AI assistant"
      @click="openAssistant"
    >
      <span class="ai-assistant__trigger-core">
        <span class="ai-assistant__trigger-eye" />
        <span class="ai-assistant__trigger-eye" />
      </span>
      <span class="ai-assistant__trigger-ring ai-assistant__trigger-ring--one" />
      <span class="ai-assistant__trigger-ring ai-assistant__trigger-ring--two" />
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
.ai-assistant__prompt-bubble {
  position: fixed;
  right: 18px;
  bottom: 128px;
  z-index: 69;
  min-width: 188px;
  max-width: 228px;
  padding: 12px 14px;
  border: 1px solid rgba(224, 244, 255, 0.22);
  border-radius: 18px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.16), rgba(255, 255, 255, 0.08));
  box-shadow:
    0 18px 38px rgba(3, 17, 36, 0.16),
    inset 0 1px 0 rgba(255, 255, 255, 0.14);
  backdrop-filter: blur(18px) saturate(135%);
  color: rgba(12, 31, 51, 0.88);
  font-size: 13px;
  font-weight: 600;
  line-height: 1.55;
  letter-spacing: 0.01em;
  pointer-events: none;
  user-select: none;
  text-align: left;
  animation: ai-prompt-float 4.6s ease-in-out infinite;
}

.ai-assistant__prompt-bubble::after {
  content: '';
  position: absolute;
  right: 28px;
  bottom: -8px;
  height: 16px;
  width: 16px;
  border-right: 1px solid rgba(224, 244, 255, 0.22);
  border-bottom: 1px solid rgba(224, 244, 255, 0.22);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.14), rgba(255, 255, 255, 0.08));
  transform: rotate(45deg);
}

.ai-assistant__trigger {
  position: fixed;
  right: 24px;
  bottom: 28px;
  z-index: 70;
  display: inline-flex;
  height: 88px;
  width: 88px;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(74, 216, 255, 0.34);
  border-radius: 999px;
  background:
    radial-gradient(circle at 28% 20%, rgba(255, 255, 255, 0.32), transparent 30%),
    radial-gradient(circle at 35% 32%, rgba(88, 216, 255, 0.26), transparent 58%),
    linear-gradient(160deg, rgba(48, 171, 212, 0.98), rgba(9, 42, 78, 0.98));
  box-shadow:
    0 20px 36px rgba(3, 17, 36, 0.32),
    0 10px 18px rgba(15, 115, 164, 0.18),
    inset 0 -12px 18px rgba(4, 20, 42, 0.22),
    inset 0 0 0 1px rgba(255, 255, 255, 0.08);
  color: #ecfeff;
  cursor: pointer;
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
    0 28px 48px rgba(3, 17, 36, 0.38),
    0 14px 24px rgba(15, 115, 164, 0.2),
    inset 0 -14px 20px rgba(4, 20, 42, 0.24),
    inset 0 0 0 1px rgba(255, 255, 255, 0.1);
}

.ai-assistant__trigger-core {
  position: relative;
  display: grid;
  grid-template-columns: repeat(2, 10px);
  gap: 12px;
  z-index: 2;
  transform: translateY(-6px);
}

.ai-assistant__trigger-eye {
  height: 10px;
  width: 10px;
  border-radius: 999px;
  background: #f8fafc;
  box-shadow: 0 0 14px rgba(236, 254, 255, 0.58);
}

.ai-assistant__trigger-ring {
  position: absolute;
  border: 1px solid rgba(230, 248, 255, 0.2);
  border-radius: 999px;
}

.ai-assistant__trigger-ring--one {
  inset: 11px;
}

.ai-assistant__trigger-ring--two {
  inset: 22px;
}

.ai-assistant__trigger-label {
  position: absolute;
  bottom: 16px;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  z-index: 2;
  color: rgba(242, 250, 255, 0.96);
  text-shadow: 0 2px 8px rgba(6, 18, 34, 0.25);
}

.ai-assistant__overlay {
  position: fixed;
  inset: 0;
  z-index: 90;
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
  .ai-assistant__prompt-bubble {
    right: 14px;
    bottom: 110px;
    min-width: 164px;
    max-width: 196px;
    padding: 10px 12px;
    font-size: 12px;
  }

  .ai-assistant__prompt-bubble::after {
    right: 24px;
  }

  .ai-assistant__trigger {
    right: 16px;
    bottom: 20px;
    height: 78px;
    width: 78px;
    border-radius: 999px;
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
</style>
