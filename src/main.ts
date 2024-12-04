import { createApp } from 'vue'
import App from './App.vue'

import router from './router' // 导入 router
import './styles/common.scss'
import store from './store'

// 如果您正在使用CDN引入，请删除下面一行。
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import '@imengyu/vue3-context-menu/lib/vue3-context-menu.css'
import ContextMenu from '@imengyu/vue3-context-menu'

const app = createApp(App)
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(store)
app.use(router) // 使用 router
app.use(ContextMenu) // 右键菜单
app.mount('#app')
