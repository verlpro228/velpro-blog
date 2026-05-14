export type AiChatRole = 'system' | 'user' | 'assistant'

export interface AiChatMessage {
  role: AiChatRole
  content: string
}

export interface LongcatStreamChunk {
  choices?: Array<{
    delta?: {
      content?: string | Array<{ type?: string; text?: string }>
    }
    message?: {
      content?: string | Array<{ type?: string; text?: string }>
    }
    finish_reason?: string | null
  }>
  error?: {
    message?: string
  }
}

export interface StreamLongcatChatOptions {
  messages: AiChatMessage[]
  signal?: AbortSignal
  onChunk: (content: string) => void
}
