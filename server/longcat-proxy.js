const DEFAULT_LONGCAT_BASE_URL = 'https://api.longcat.chat/openai'
const DEFAULT_LONGCAT_MODEL = 'LongCat-Flash-Lite'

function trimTrailingSlash(value) {
  return value.replace(/\/+$/, '')
}

function resolveEnvValue(env, primaryKey, fallbackKey) {
  const primaryValue = env?.[primaryKey]

  if (typeof primaryValue === 'string' && primaryValue.trim()) {
    return primaryValue.trim()
  }

  const fallbackValue = env?.[fallbackKey]

  if (typeof fallbackValue === 'string' && fallbackValue.trim()) {
    return fallbackValue.trim()
  }

  return ''
}

export function resolveLongcatServerConfig(env = process.env) {
  const apiKey = resolveEnvValue(env, 'LONGCAT_API_KEY', 'VITE_LONGCAT_API_KEY')
  const baseUrl = resolveEnvValue(env, 'LONGCAT_BASE_URL', 'VITE_LONGCAT_BASE_URL') || DEFAULT_LONGCAT_BASE_URL
  const model = resolveEnvValue(env, 'LONGCAT_MODEL', 'VITE_LONGCAT_MODEL') || DEFAULT_LONGCAT_MODEL

  return {
    apiKey,
    apiUrl: `${trimTrailingSlash(baseUrl)}/v1/chat/completions`,
    model,
  }
}

export function createLongcatRequestBody(messages, model) {
  return {
    model,
    stream: true,
    temperature: 0.7,
    messages: Array.isArray(messages)
      ? messages.map((message) => ({
          role: message?.role,
          content: message?.content,
        }))
      : [],
  }
}

export async function readLongcatErrorMessage(response) {
  try {
    const data = await response.json()
    return data?.error?.message || data?.message || `Longcat request failed with status ${response.status}`
  } catch {
    return `Longcat request failed with status ${response.status}`
  }
}

export async function requestLongcatChat(messages, env = process.env, signal) {
  const config = resolveLongcatServerConfig(env)

  if (!config.apiKey) {
    throw new Error('Missing LONGCAT_API_KEY on the server.')
  }

  const response = await fetch(config.apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify(createLongcatRequestBody(messages, config.model)),
    signal,
  })

  return response
}
