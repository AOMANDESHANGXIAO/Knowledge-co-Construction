<script setup lang="ts">
/**
 * 迷你版的仪表盘
 */
import { dev_data } from './data'
import MyAlert from '@/components/ElementPlusPackage/MyAlert.vue'

defineOptions({
  name: 'dash-board-mini',
})

withDefaults(
  defineProps<{
    list?: Array<{
      title: '个人' | '同伴' | '小组'
      type: 'success' | 'warning' | 'error' | 'info'
      suggestions: string[]
    }>
  }>(),
  {
    list: () => dev_data,
  }
)

const emits = defineEmits<{
  (e: 'checkDetail'): void
}>()

const handleCheckDetail = () => {
  emits('checkDetail')
}
</script>

<template>
  <div class="dash-board-mini">
    <header>
      <div class="title">✨学习仪表盘✨</div>
      <el-text type="info" size="small" @click="handleCheckDetail"
        >查看详情</el-text
      >
    </header>
    <section class="alert-layout">
      <my-alert
        v-for="item in list"
        :key="item.title"
        v-bind="item"
        :list="item.suggestions"
        :closable="false"
        show-icon
      ></my-alert>
    </section>
  </div>
</template>

<style scoped lang="scss">
$mini-dashboard-width: 400px;
$min-dash-board-ratio: 0.75;
.dash-board-mini {
  width: $mini-dashboard-width;
  min-height: calc($mini-dashboard-width * $min-dash-board-ratio);
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
  padding: 20px;

  header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px;
    .title {
      font-size: 20px;
      font-weight: bold;
      color: var(--light-dark-color);
    }
    &:deep(.el-text) {
      &:hover {
        cursor: pointer;
        text-decoration: underline;
        color: var(--theme-color);
      }
    }
  }

  .alert-layout {
    display: flex;
    flex-direction: column;
    gap: 10px;
    .title {
      font-size: 19px;
      font-weight: bold;
    }
  }
}
</style>
