import type { LongcatStreamChunk, StreamLongcatChatOptions } from '@/types/ai'

const AI_PROXY_ENDPOINT = '/api/ai/chat'

function resolveDeltaContent(chunk: LongcatStreamChunk) {
  const content = chunk.choices?.[0]?.delta?.content ?? chunk.choices?.[0]?.message?.content

  if (typeof content === 'string') {
    return content
  }

  if (Array.isArray(content)) {
    return content
      .map((item) => item.text ?? '')
      .filter(Boolean)
      .join('')
  }

  return ''
}

function normalizeStreamBuffer(value: string) {
  return value.replace(/\r\n/g, '\n')
}

function extractTextFromJsonResponse(payload: unknown) {
  if (!payload || typeof payload !== 'object') {
    return ''
  }

  const chunk = payload as LongcatStreamChunk
  return resolveDeltaContent(chunk)
}

function parseSsePayload(payload: string) {
  if (!payload || payload === '[DONE]') {
    return {
      done: payload === '[DONE]',
      text: '',
    }
  }

  const chunk = JSON.parse(payload) as LongcatStreamChunk

  if (chunk.error?.message) {
    throw new Error(chunk.error.message)
  }

  return {
    done: false,
    text: resolveDeltaContent(chunk),
  }
}

async function readErrorMessage(response: Response) {
  try {
    const data = (await response.json()) as { error?: { message?: string }; message?: string }
    return data.error?.message || data.message || `AI proxy request failed with status ${response.status}`
  } catch {
    return `AI proxy request failed with status ${response.status}`
  }
}

function processStreamEvents(buffer: string, onChunk: (content: string) => void) {
  const normalized = normalizeStreamBuffer(buffer)
  const events = normalized.split('\n\n')
  const remainder = events.pop() ?? ''

  for (const eventText of events) {
    const lines = eventText
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)

    for (const line of lines) {
      if (!line.startsWith('data:')) {
        continue
      }

      const payload = line.slice(5).trim()
      const parsed = parseSsePayload(payload)

      if (parsed.done) {
        return {
          done: true,
          remainder: '',
        }
      }

      if (parsed.text) {
        onChunk(parsed.text)
      }
    }
  }

  return {
    done: false,
    remainder,
  }
}

export async function streamLongcatChatCompletion({ messages, signal, onChunk }: StreamLongcatChatOptions) {
  const response = await fetch(AI_PROXY_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messages,
    }),
    signal,
  })

  if (!response.ok) {
    throw new Error(await readErrorMessage(response))
  }

  const contentType = response.headers.get('content-type') || ''

  if (!contentType.includes('text/event-stream')) {
    const payload = (await response.json()) as unknown
    const text = extractTextFromJsonResponse(payload)

    if (text) {
      onChunk(text)
      return
    }

    throw new Error('AI proxy returned an unsupported response format.')
  }

  if (!response.body) {
    throw new Error('AI proxy did not return a readable stream.')
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder('utf-8')
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()

    buffer += decoder.decode(value, { stream: !done })
    const processed = processStreamEvents(buffer, onChunk)
    buffer = processed.remainder

    if (processed.done) {
      return
    }

    if (done) {
      const trailing = normalizeStreamBuffer(buffer).trim()

      if (trailing.startsWith('data:')) {
        const payload = trailing.slice(5).trim()
        const parsed = parseSsePayload(payload)

        if (parsed.text) {
          onChunk(parsed.text)
        }
      }

      return
    }
  }
}
