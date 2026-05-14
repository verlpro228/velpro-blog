<script setup lang="ts">
import AppAiAssistant from '@/components/common/AppAiAssistant.vue'
import AppFooter from '@/components/common/AppFooter.vue'
import AppNavbar from '@/components/common/AppNavbar.vue'
</script>

<template>
  <div class="app-shell">
    <AppNavbar />
    <main class="pt-32 md:pt-24">
      <RouterView v-slot="{ Component, route }">
        <Transition name="route-fade" mode="out-in">
          <component :is="Component" :key="route.fullPath" />
        </Transition>
      </RouterView>
    </main>
    <AppFooter />
    <AppAiAssistant />
  </div>
</template>
