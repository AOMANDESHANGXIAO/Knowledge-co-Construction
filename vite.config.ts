import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

import { resolve } from 'path'

// 引入自动导入 api
import AutoImport from 'unplugin-auto-import/vite'
// 引入配置需要自动导入的组件
import Components from 'unplugin-vue-components/vite'
import {
  ElementPlusResolver,
  NaiveUiResolver,
} from 'unplugin-vue-components/resolvers'
import { spaLoading } from 'vite-plugin-spa-loading'
// 在 vite.config.ts 中添加图标依赖
// import Icons from 'unplugin-icons/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      // 配置需要自动导入的模块
      imports: ['vue', 'vue-router'],
      resolvers: [ElementPlusResolver()],
      dts: 'src/type.ts/auto-import.d.ts',
    }),
    // 配置需要自动导入的组件
    Components({
      // 导入存放的位置
      dts: 'src/type.ts/components.d.ts',
      resolvers: [ElementPlusResolver(), NaiveUiResolver()],
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
})
