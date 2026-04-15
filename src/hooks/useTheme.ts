import { computed, ref } from 'vue'
import { STORAGE_KEYS } from '@/constants/app'
import { getLocalStorage, setLocalStorage } from '@/utils/storage'

export type ThemeMode = 'dark' | 'light'

const theme = ref<ThemeMode>('dark')
let initialized = false

const applyTheme = (value: ThemeMode) => {
  theme.value = value

  if (typeof document === 'undefined') {
    return
  }

  const root = document.documentElement
  root.dataset.theme = value
  root.classList.toggle('theme-dark', value === 'dark')
  root.classList.toggle('theme-light', value === 'light')
}

const getStoredTheme = () => {
  const storedTheme = getLocalStorage<ThemeMode | null>(STORAGE_KEYS.theme, null)
  return storedTheme === 'dark' || storedTheme === 'light' ? storedTheme : null
}

const initializeTheme = () => {
  if (initialized || typeof window === 'undefined') {
    return
  }

  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  applyTheme(getStoredTheme() ?? (mediaQuery.matches ? 'dark' : 'light'))

  mediaQuery.addEventListener('change', (event) => {
    if (getStoredTheme()) {
      return
    }

    applyTheme(event.matches ? 'dark' : 'light')
  })

  initialized = true
}

const setTheme = (value: ThemeMode) => {
  applyTheme(value)
  setLocalStorage(STORAGE_KEYS.theme, value)
}

const toggleTheme = () => {
  setTheme(theme.value === 'dark' ? 'light' : 'dark')
}

export function useTheme() {
  return {
    theme,
    isDark: computed(() => theme.value === 'dark'),
    initializeTheme,
    setTheme,
    toggleTheme,
  }
}
