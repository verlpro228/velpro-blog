import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

export default defineConfig(() => {
  const elementPlusResolver = ElementPlusResolver({
    importStyle: 'css',
  })

  return {
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
  }
})
