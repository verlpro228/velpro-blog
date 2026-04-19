<script setup lang="ts">
import { computed } from 'vue'
import { MoonNight, Sunny } from '@element-plus/icons-vue'
import { useRoute, useRouter } from 'vue-router'
import { ADMIN_NAVIGATION_ITEMS } from '@/constants/app'
import { useAuth } from '@/hooks/useAuth'
import { useTheme } from '@/hooks/useTheme'
import { useDocsStore } from '@/store/modules/docs'
import { useUserStore } from '@/store/modules/user'

const route = useRoute()
const router = useRouter()
const docsStore = useDocsStore()
const userStore = useUserStore()
const { logout } = useAuth()
const { isDark, toggleTheme } = useTheme()

const currentTitle = computed(() =>
  typeof route.meta.title === 'string' ? route.meta.title : '后台工作台',
)

const themeActionLabel = computed(() => (isDark.value ? '切换浅色模式' : '切换深色模式'))
const themeIcon = computed(() => (isDark.value ? Sunny : MoonNight))

const syncLabel = computed(() => {
  if (!docsStore.lastFetchedAt) {
    return '等待同步'
  }

  return `最近同步：${new Date(docsStore.lastFetchedAt).toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })}`
})
</script>

<template>
  <div class="app-shell">
    <div class="grid min-h-screen lg:grid-cols-[260px_1fr]">
      <aside class="app-panel-strong border-b p-4 sm:p-6 lg:border-b-0 lg:border-r">
        <button class="mb-8 text-left sm:mb-10" @click="router.push('/')">
          <p class="app-overline text-xs uppercase tracking-[0.32em]">后台控制台</p>
          <h2 class="app-heading mt-2 text-xl font-semibold sm:text-2xl">内容管理工作台</h2>
        </button>

        <div class="app-card mb-6 rounded-[1.5rem] p-4 sm:mb-8">
          <p class="app-caption text-xs uppercase tracking-[0.18em]">当前用户</p>
          <p class="app-heading mt-3 text-lg font-semibold">{{ userStore.profile?.name ?? '管理员' }}</p>
          <p class="app-caption mt-1 text-sm">{{ userStore.profile?.tagline ?? '前端工程师' }}</p>
        </div>

        <nav class="space-y-2">
          <RouterLink
            v-for="item in ADMIN_NAVIGATION_ITEMS"
            :key="item.path"
            :to="item.path"
            class="app-choice-button block rounded-2xl px-4 py-3 text-sm font-medium"
            active-class="is-active"
          >
            {{ item.label }}
          </RouterLink>
        </nav>

        <div class="mt-6 flex flex-col gap-3 sm:mt-8">
          <el-button circle :aria-label="themeActionLabel" :title="themeActionLabel" @click="toggleTheme">
            <el-icon :size="18">
              <component :is="themeIcon" />
            </el-icon>
          </el-button>
          <el-button plain @click="router.push('/')">返回站点</el-button>
          <el-button @click="logout">退出登录</el-button>
        </div>
      </aside>

      <main class="overflow-hidden">
        <header class="app-panel border-b px-4 py-4 backdrop-blur sm:px-8 sm:py-5">
          <p class="app-overline text-xs uppercase tracking-[0.28em]">工作区</p>
          <div class="mt-2 flex flex-wrap items-center justify-between gap-4">
            <div class="min-w-0">
              <h1 class="app-heading text-xl font-semibold sm:text-2xl">{{ currentTitle }}</h1>
              <p class="app-caption mt-2 text-sm">{{ syncLabel }}</p>
            </div>
          </div>
        </header>

        <RouterView v-slot="{ Component, route: currentRoute }">
          <Transition name="route-fade" mode="out-in">
            <component :is="Component" :key="currentRoute.fullPath" />
          </Transition>
        </RouterView>
      </main>
    </div>
  </div>
</template>
