import {createApp} from 'vue'
import App from './App.vue'
import router from './router' // 导入 router
import './styles/common.scss'
import {useStore} from './store'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import '@imengyu/vue3-context-menu/lib/vue3-context-menu.css'
import ContextMenu from '@imengyu/vue3-context-menu'

const app = createApp(App)
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}
useStore(app).use(router).use(ContextMenu).mount('#app')
