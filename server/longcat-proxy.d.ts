export interface LongcatServerConfig {
  apiKey: string
  apiUrl: string
  model: string
}

export function resolveLongcatServerConfig(env?: Record<string, string | undefined>): LongcatServerConfig

export function createLongcatRequestBody(
  messages: Array<{ role?: string; content?: string }>,
  model: string,
): {
  model: string
  stream: true
  temperature: number
  messages: Array<{ role?: string; content?: string }>
}

export function readLongcatErrorMessage(response: Response): Promise<string>

export function requestLongcatChat(
  messages: Array<{ role?: string; content?: string }>,
  env?: Record<string, string | undefined>,
  signal?: AbortSignal,
): Promise<Response>
