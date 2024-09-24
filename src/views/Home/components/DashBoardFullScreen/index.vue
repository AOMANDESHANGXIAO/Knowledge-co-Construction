<script lang="ts" setup>
/**
 * 全屏版的仪表盘
 */
import DashBoardItem from './components/index.vue'
import type { ComposeOption } from 'echarts/core'
import type {
  // 系列类型的定义后缀都为 SeriesOption
  BarSeriesOption,
  RadarSeriesOption,
  GraphSeriesOption,
} from 'echarts/charts'


defineOptions({
  name: 'dash-board-full-screen',
})

defineProps<{
  dashBoardRenderList: Array<{
    title: string
    option:
      | ComposeOption<BarSeriesOption>
      | ComposeOption<GraphSeriesOption>
      | ComposeOption<RadarSeriesOption>
    type: 'radar' | 'graph' | 'bar'
  }>
  alerts: Array<{ title: string; type: 'info' | 'success' | 'warning' | 'error'; suggestions: string[] }>
}>()
</script>

<template>
  <div class="dash-board-full-screen">
    <DashBoardItem
      v-for="(item,index) in dashBoardRenderList"
      :key="item.title"
      :title="item.title"
      :option="item.option"
      :type="item.type"
      :alert="alerts[index]"
    >
    </DashBoardItem>
  </div>
</template>

<style lang="scss" scoped>
$dash-board-full-screen-width: 100%;
.dash-board-full-screen {
  box-sizing: border-box;
  display: flex;
  justify-content: space-around;
  gap: 10px;
  width: $dash-board-full-screen-width;
  height: 100%;
}
</style>
