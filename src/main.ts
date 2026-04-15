import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import pinia from './store'
import { useTheme } from './hooks/useTheme'
import './styles/index.css'

const { initializeTheme } = useTheme()
initializeTheme()

const app = createApp(App)

app.use(pinia)
app.use(router)
app.mount('#app')
