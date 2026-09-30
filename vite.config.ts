import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const elementPlusResolver = ElementPlusResolver({
    importStyle: 'css',
  })
  const apiProxyTarget = env.VITE_API_PROXY_TARGET || 'http://127.0.0.1:8000'

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
      proxy: {
        // 开发环境把 /api 与根级 /sitemap.xml 都转发到本地 FastAPI（uvicorn），
        // 目标可用 VITE_API_PROXY_TARGET 覆盖
        '/api': {
          target: apiProxyTarget,
          changeOrigin: true,
        },
        '/sitemap.xml': {
          target: apiProxyTarget,
          changeOrigin: true,
        },
      },
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
    ],
  }
})
