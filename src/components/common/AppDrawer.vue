<script setup lang="ts">
import { computed, onBeforeUnmount, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    title?: string
    width?: string
  }>(),
  {
    title: '',
    width: 'min(560px, 100vw)',
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const drawerWidth = computed(() => props.width)
let previousOverflow = ''

const close = () => {
  emit('update:modelValue', false)
}

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && props.modelValue) {
    close()
  }
}

watch(
  () => props.modelValue,
  (visible) => {
    if (typeof document === 'undefined') {
      return
    }

    if (visible) {
      previousOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', handleKeydown)
      return
    }

    document.body.style.overflow = previousOverflow
    window.removeEventListener('keydown', handleKeydown)
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  if (typeof document !== 'undefined') {
    document.body.style.overflow = previousOverflow
  }

  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <Teleport to="body">
    <Transition name="app-drawer-fade">
      <div v-if="modelValue" class="app-drawer fixed inset-0 z-[80]">
        <button class="app-drawer__overlay absolute inset-0 border-0 p-0" aria-label="关闭抽屉" @click="close" />
        <Transition name="app-drawer-slide">
          <aside
            v-if="modelValue"
            class="app-drawer__panel absolute right-0 top-0 h-full"
            :style="{ width: drawerWidth }"
            role="dialog"
            aria-modal="true"
          >
            <header class="app-drawer__header flex items-start justify-between gap-4 px-4 py-4 sm:px-6 sm:py-5">
              <div class="min-w-0">
                <p v-if="title" class="app-heading truncate text-xl font-semibold">{{ title }}</p>
              </div>
              <button
                class="app-icon-button h-10 w-10 shrink-0 border-0 p-0"
                type="button"
                aria-label="关闭抽屉"
                @click="close"
              >
                <span class="text-lg leading-none">×</span>
              </button>
            </header>

            <div class="app-drawer__body h-[calc(100%-5.25rem)] overflow-y-auto px-4 pb-6 sm:px-6 sm:pb-8">
              <slot />
            </div>
          </aside>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.app-drawer__overlay {
  background: rgba(2, 6, 23, 0.6);
}

.app-drawer__panel {
  border-left: 1px solid var(--color-border);
  background: var(--color-bg-secondary);
  box-shadow: -24px 0 60px rgba(2, 6, 23, 0.24);
}

.app-drawer__header {
  border-bottom: 1px solid var(--color-border);
}

.app-drawer-fade-enter-active,
.app-drawer-fade-leave-active {
  transition: opacity 0.25s ease;
}

.app-drawer-fade-enter-from,
.app-drawer-fade-leave-to {
  opacity: 0;
}

.app-drawer-slide-enter-active,
.app-drawer-slide-leave-active {
  transition: transform 0.28s ease;
}

.app-drawer-slide-enter-from,
.app-drawer-slide-leave-to {
  transform: translateX(100%);
}
</style>
