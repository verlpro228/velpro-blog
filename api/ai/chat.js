import { Readable } from 'node:stream'
import { readLongcatErrorMessage, requestLongcatChat } from '../../server/longcat-proxy.js'

function setCorsHeaders(response) {
  response.setHeader('Access-Control-Allow-Origin', '*')
  response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type')
}

function parseRequestBody(body) {
  if (!body) {
    return {}
  }

  if (typeof body === 'string') {
    try {
      return JSON.parse(body)
    } catch {
      return {}
    }
  }

  return body
}

function setProxyHeaders(response, contentType) {
  setCorsHeaders(response)
  response.setHeader('Content-Type', contentType || 'text/event-stream; charset=utf-8')
  response.setHeader('Cache-Control', 'no-cache, no-transform')
  response.setHeader('X-Accel-Buffering', 'no')
}

export default async function handler(request, response) {
  setCorsHeaders(response)

  if (request.method === 'OPTIONS') {
    response.status(204).end()
    return
  }

  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST')
    response.status(405).json({ error: { message: 'Method not allowed.' } })
    return
  }

  const payload = parseRequestBody(request.body)
  const messages = Array.isArray(payload?.messages) ? payload.messages : []

  if (!messages.length) {
    response.status(400).json({ error: { message: 'Missing chat messages.' } })
    return
  }

  let upstream

  try {
    upstream = await requestLongcatChat(messages, process.env)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to reach Longcat.'
    response.status(500).json({ error: { message } })
    return
  }

  if (!upstream.ok) {
    response.status(upstream.status).json({
      error: {
        message: await readLongcatErrorMessage(upstream),
      },
    })
    return
  }

  const contentType = upstream.headers.get('content-type') || ''

  if (!upstream.body) {
    response.status(502).json({ error: { message: 'Longcat returned an empty response body.' } })
    return
  }

  if (!contentType.includes('text/event-stream')) {
    const text = await upstream.text()
    response.status(200).setHeader('Content-Type', contentType || 'application/json; charset=utf-8')
    response.send(text)
    return
  }

  setProxyHeaders(response, contentType)
  Readable.fromWeb(upstream.body).pipe(response)
}
