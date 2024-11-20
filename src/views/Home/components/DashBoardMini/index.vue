<script setup lang="ts">
/**
 * 迷你版的仪表盘
 */
import { dev_data } from './data'
import MyAlert from '@/components/ElementPlusPackage/MyAlert.vue'
import { ref } from 'vue'

defineOptions({
  name: 'dash-board-mini',
})

withDefaults(
  defineProps<{
    list?: Array<{
      title: string
      type: 'success' | 'warning' | 'error' | 'info'
      suggestions: string[]
    }>
    title: string
  }>(),
  {
    list: () => dev_data,
    title: '加载中...',
  }
)

const emits = defineEmits<{
  (e: 'checkDetail'): void
}>()

const handleCheckDetail = () => {
  emits('checkDetail')
}
const getTwoSuggestion = (suggestions: string[]) => {
  if (suggestions.length < 2) {
    return suggestions
  }

  return [...suggestions.slice(0, 2), '...']  
}

const isMinimized = ref(false)

const toggleMinimize = () => {
  isMinimized.value = !isMinimized.value
}
</script>

<template>
  <div class="dash-board-mini" :class="{ 'minimized': isMinimized }">
    <header>
      <div class="title">✨学习仪表盘✨</div>
      <div class="header-actions">
        <el-button
          class="minimize-btn"
          :icon="isMinimized ? 'Plus' : 'Minus'"
          size="small"
          text
          @click="toggleMinimize"
        />
        <el-text
          type="info"
          size="small"
          @click="handleCheckDetail"
          style="cursor: pointer; text-decoration: underline"
          >查看详情</el-text
        >
      </div>
    </header>
    <div class="content" :class="{ 'hidden': isMinimized }">
      <section class="time-layout">
        <n-gradient-text type="info">当前阶段:</n-gradient-text>
        <n-gradient-text type="success"> {{ title }} </n-gradient-text>
      </section>
      <section class="alert-layout">
        <my-alert
          v-for="item in list"
          :key="item.title"
          v-bind="item"
          :list="getTwoSuggestion(item.suggestions)"
          :closable="false"
          show-icon
        ></my-alert>
      </section>
    </div>
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
  transition: all 0.3s ease;

  &.minimized {
    min-height: auto;
    .content {
      max-height: 0;
      opacity: 0;
      overflow: hidden;
    }
  }

  header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px;
    
    .header-actions {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .minimize-btn {
      padding: 2px;
      &:hover {
        color: var(--theme-color);
      }
    }
  }

  .content {
    transition: all 0.3s ease;
    max-height: 1000px;
    opacity: 1;
    
    &.hidden {
      margin: 0;
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
  .time-layout {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 10px;
    margin-bottom: 5px;
    background-color: rgba(0, 0, 0, 0.05);
  }
  .n-gradient-text {
    font-size: 32px;
    font-weight: bold;
  }
}
</style>
