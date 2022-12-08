import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import 'element-plus/dist/index.css'
import '@/styles/global.scss'

const pinia = createPinia()

// eslint-disable-next-line newline-per-chained-call
createApp(App).use(router).use(pinia).mount('#app')
