import { fileURLToPath, URL } from 'node:url'
import { Readable } from 'node:stream'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import { readLongcatErrorMessage, requestLongcatChat } from './server/longcat-proxy.js'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const elementPlusResolver = ElementPlusResolver({
    importStyle: 'css',
  })

  return {
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    build: {
      cssCodeSplit: true,
      chunkSizeWarningLimit: 650,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes('node_modules')) {
              return
            }

            const normalizedId = id.replace(/\\/g, '/')

            if (
              /\/node_modules\/vue\//.test(normalizedId) ||
              /\/node_modules\/@vue\//.test(normalizedId) ||
              /\/node_modules\/@vueuse\//.test(normalizedId)
            ) {
              return 'vue-vendor'
            }

            if (id.includes('markdown-it') || id.includes('highlight.js')) {
              return 'markdown'
            }

            if (id.includes('gsap')) {
              return 'motion'
            }

            if (id.includes('vue-router')) {
              return 'router'
            }

            if (id.includes('fuse.js')) {
              return 'search-tools'
            }

            if (id.includes('axios')) {
              return 'http-tools'
            }

            if (id.includes('pinia') || id.includes('pinia-plugin-persistedstate')) {
              return 'state-tools'
            }
          },
        },
      },
    },
    server: {
      open: true,
    },
    plugins: [
      vue(),
      AutoImport({
        imports: ['vue', 'vue-router', 'pinia'],
        resolvers: [elementPlusResolver],
        dts: 'src/auto-imports.d.ts',
      }),
      Components({
        resolvers: [elementPlusResolver],
        dts: 'src/components.d.ts',
      }),
      {
        name: 'velpro-longcat-dev-proxy',
        configureServer(server) {
          server.middlewares.use('/api/ai/chat', async (request, response, next) => {
            if (request.method !== 'POST') {
              next()
              return
            }

            const chunks: Buffer[] = []

            request.on('data', (chunk) => {
              chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
            })

            request.on('error', () => {
              response.statusCode = 500
              response.setHeader('Content-Type', 'application/json; charset=utf-8')
              response.end(JSON.stringify({ error: { message: 'Failed to read request body.' } }))
            })

            request.on('end', async () => {
              let payload: { messages?: unknown } = {}

              try {
                const rawBody = Buffer.concat(chunks).toString('utf-8')
                payload = rawBody ? JSON.parse(rawBody) : {}
              } catch {
                response.statusCode = 400
                response.setHeader('Content-Type', 'application/json; charset=utf-8')
                response.end(JSON.stringify({ error: { message: 'Invalid JSON body.' } }))
                return
              }

              const messages = Array.isArray(payload.messages) ? payload.messages : []

              if (!messages.length) {
                response.statusCode = 400
                response.setHeader('Content-Type', 'application/json; charset=utf-8')
                response.end(JSON.stringify({ error: { message: 'Missing chat messages.' } }))
                return
              }

              let upstream

              try {
                upstream = await requestLongcatChat(messages, env)
              } catch (error) {
                response.statusCode = 500
                response.setHeader('Content-Type', 'application/json; charset=utf-8')
                response.end(
                  JSON.stringify({
                    error: {
                      message: error instanceof Error ? error.message : 'Failed to reach Longcat.',
                    },
                  }),
                )
                return
              }

              if (!upstream.ok) {
                response.statusCode = upstream.status
                response.setHeader('Content-Type', 'application/json; charset=utf-8')
                response.end(
                  JSON.stringify({
                    error: {
                      message: await readLongcatErrorMessage(upstream),
                    },
                  }),
                )
                return
              }

              const contentType = upstream.headers.get('content-type') || ''

              if (!upstream.body) {
                response.statusCode = 502
                response.setHeader('Content-Type', 'application/json; charset=utf-8')
                response.end(JSON.stringify({ error: { message: 'Longcat returned an empty response body.' } }))
                return
              }

              if (!contentType.includes('text/event-stream')) {
                response.statusCode = 200
                response.setHeader('Content-Type', contentType || 'application/json; charset=utf-8')
                response.end(await upstream.text())
                return
              }

              response.statusCode = 200
              response.setHeader('Content-Type', contentType || 'text/event-stream; charset=utf-8')
              response.setHeader('Cache-Control', 'no-cache, no-transform')
              response.setHeader('X-Accel-Buffering', 'no')
              Readable.fromWeb(upstream.body as any).pipe(response)
            })
          })
        },
      },
    ],
  }
})
