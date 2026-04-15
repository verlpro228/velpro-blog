<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { NAVIGATION_ITEMS } from '@/constants/app'
import { useAuth } from '@/hooks/useAuth'
import { useTheme } from '@/hooks/useTheme'
import { useUserStore } from '@/store/modules/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const { logout } = useAuth()
const { isDark, toggleTheme } = useTheme()

const isAdminRoute = computed(() => route.path.startsWith('/admin'))
const themeActionLabel = computed(() => (isDark.value ? '切换浅色模式' : '切换深色模式'))
</script>

<template>
  <header class="fixed inset-x-0 top-0 z-50 px-3 py-3 sm:px-4 sm:py-4">
    <div class="app-panel mx-auto max-w-7xl rounded-[1.5rem] px-4 py-3 backdrop-blur sm:rounded-full sm:px-6">
      <div class="flex items-center justify-between gap-3">
        <div class="flex min-w-0 items-center gap-2.5 sm:gap-3">
          <div
            class="h-9 w-9 shrink-0 rounded-full bg-gradient-to-br from-cyan-400 via-sky-500 to-blue-600 sm:h-10 sm:w-10"
          />
          <div class="min-w-0">
            <p class="app-overline hidden text-[10px] uppercase tracking-[0.28em] sm:block">技术知识博客</p>
            <h1 class="app-heading truncate text-base font-semibold sm:text-lg">Velpro Blog</h1>
          </div>
        </div>

        <nav class="hidden items-center gap-6 md:flex">
          <RouterLink
            v-for="item in NAVIGATION_ITEMS"
            :key="item.path"
            :to="item.path"
            class="app-nav-link text-sm font-medium"
            :class="{ 'is-active': route.path === item.path }"
          >
            {{ item.label }}
          </RouterLink>
        </nav>

        <div class="flex shrink-0 items-center gap-2 sm:gap-3">
          <button
            class="app-icon-button h-10 w-10 shrink-0 border-0 p-0 shadow-md hover:shadow-lg sm:h-11 sm:w-auto sm:px-4"
            type="button"
            :aria-label="themeActionLabel"
            :title="themeActionLabel"
            @click="toggleTheme"
          >
            <svg
              v-if="isDark"
              viewBox="0 0 24 24"
              class="h-[18px] w-[18px]"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
            >
              <circle cx="12" cy="12" r="4.2" />
              <path
                d="M12 2.5v2.2M12 19.3v2.2M4.93 4.93l1.56 1.56M17.51 17.51l1.56 1.56M2.5 12h2.2M19.3 12h2.2M4.93 19.07l1.56-1.56M17.51 6.49l1.56-1.56"
              />
            </svg>
            <svg
              v-else
              viewBox="0 0 24 24"
              class="h-[18px] w-[18px]"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
            >
              <path d="M21 12.8A8.8 8.8 0 1 1 11.2 3a7.1 7.1 0 0 0 9.8 9.8Z" />
            </svg>
            <span class="hidden lg:inline">{{ isDark ? '浅色模式' : '深色模式' }}</span>
          </button>

          <button
            v-if="!isAdminRoute"
            class="app-button-secondary hidden h-10 border-0 px-4 text-sm shadow-md hover:shadow-lg sm:inline-flex lg:h-11 lg:px-5"
            type="button"
            @click="router.push('/admin/editor')"
          >
            进入后台
          </button>

          <button
            v-if="userStore.isAuthenticated"
            class="app-button-secondary h-10 border-0 px-3 text-xs shadow-md hover:shadow-lg sm:h-11 sm:px-5 sm:text-sm"
            type="button"
            @click="logout"
          >
            退出登录
          </button>
        </div>
      </div>

      <div class="mt-4 md:hidden">
        <div
          class="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <RouterLink
            v-for="item in NAVIGATION_ITEMS"
            :key="item.path"
            :to="item.path"
            class="app-route-pill shrink-0 rounded-full px-4 py-2 text-sm font-medium transition"
            :class="route.path === item.path ? 'border-cyan-400/30 bg-cyan-400/12 text-slate-50' : ''"
          >
            {{ item.label }}
          </RouterLink>

          <button
            v-if="!isAdminRoute"
            type="button"
            class="app-route-pill shrink-0 rounded-full px-4 py-2 text-sm font-medium"
            @click="router.push('/admin/editor')"
          >
            后台
          </button>
        </div>
      </div>
    </div>
  </header>
</template>
