<script lang="ts" setup>
import MyAlert from '@/components/ElementPlusPackage/MyAlert.vue'
import { dev_data } from './data.ts'
import ECharts from '@/components/EChart/index.vue'

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
    <el-card style="height: 100%; width: 100%">
      <template #header>
        <header>{{ title }}</header>
      </template>
      <ECharts v-bind="$attrs" :size="{ width: 300, height: 300 }" />
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
  flex: 1;
  width: 300px;
  height: 100%;
  header {
    font-size: 18px;
    // font-weight: bold;
    text-align: center
  }
}
</style>
