<script setup lang="ts">
import AppAiAssistant from '@/components/common/AppAiAssistant.vue'
import AppCommandPalette from '@/components/common/AppCommandPalette.vue'
import AppFooter from '@/components/common/AppFooter.vue'
import AppNavbar from '@/components/common/AppNavbar.vue'
import AiSummaryFab from '@/components/common/AiSummaryFab.vue'
</script>

<template>
  <div class="app-shell">
    <AppNavbar />
    <!-- 移动端/平板竖屏导航为两行（图标行 + 胶囊行，约 148px），pt-[10rem] 保证内容不被遮挡；
         lg（1024）起桌面单行导航，xl（1280）起收紧为 pt-24 与原设计一致 -->
    <main class="pt-[10rem] lg:pt-32 xl:pt-24">
      <RouterView v-slot="{ Component, route }">
        <Transition name="route-fade" mode="out-in">
          <component :is="Component" :key="route.fullPath" />
        </Transition>
      </RouterView>
    </main>
    <AppFooter />
    <AppAiAssistant />
    <AppCommandPalette />
    <AiSummaryFab />
  </div>
</template>
