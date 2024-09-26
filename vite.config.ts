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
    spaLoading('text', { tipText: '正在加载...' }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
})
