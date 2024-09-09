<script lang="ts" setup>
import MyAlert from '@/components/ElementPlusPackage/MyAlert.vue'
import { dev_data } from './data.ts'

defineOptions({
  name: 'dashboard-item',
})
withDefaults(
  defineProps<{
    title?: string
    alert?: {
      title: string
      type: 'info' | 'success' | 'warning' | 'error'
      suggestions: string[]
    }
  }>(),
  {
    title: '默认标题',
    alert: () => dev_data[0],
  }
)
</script>

<template>
  <div class="dashboard-item">
    <el-card style="height: 100%">
      <template #header>
        <header>{{ title }}</header>
      </template>
      <slot></slot>
      <template #footer>
        <my-alert
          v-bind="alert"
          :list="alert.suggestions"
          :closable="false"
          show-icon
        ></my-alert>
      </template>
    </el-card>
  </div>
</template>

<style lang="scss" scoped>
.dashboard-item {
  width: 100%;
  height: 100%;

  header {
    font-size: 20px;
    line-height: 20px;
    text-align: center;
  }

  main {
    padding: 10px;
    height: 250px;
  }

  footer {
    .title {
      font-size: 26px;
    }
  }
}
</style>
