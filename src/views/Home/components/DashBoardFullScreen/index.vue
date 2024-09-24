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

withDefaults(
  defineProps<{
    dashBoardRenderList: Array<{
      title: string
      option:
        | ComposeOption<BarSeriesOption>
        | ComposeOption<GraphSeriesOption>
        | ComposeOption<RadarSeriesOption>
      type: 'radar' | 'graph' | 'bar'
    }>
    alerts: Array<{
      title: string
      type: 'info' | 'success' | 'warning' | 'error'
      suggestions: string[]
    }>
    timeLineList?: Array<{
      type: 'success' | 'info' | 'warning' | 'error'
      title: string
      content: string
      time: string
    }>
  }>(),
  {
    timeLineList: () => [
      {
        type: 'info',
        title: '加载中',
        content: '请耐心等待...',
        time: new Date().toLocaleString('chinese'),
      },
      {
        type: 'success',
        title: '加载中',
        content: '请耐心等待...',
        time: new Date().toLocaleString('chinese'),
      },
    ],
  }
)
</script>

<template>
  <div class="dash-board-full-screen">
    <header>
      <n-gradient-text type="success" :font-size="30">
        学习分析仪表盘详情
      </n-gradient-text>
    </header>
    <!-- timeline -->
    <el-card style="margin-bottom: 10px">
      <template #header>
        <el-text>知识建构过程一览</el-text>
      </template>
      <div class="timeline-container">
        <div>
          <n-timeline horizontal>
            <n-timeline-item
              v-for="(item, index) in timeLineList"
              v-bind="item"
              :key="index"
            />
          </n-timeline>
        </div>
      </div>
    </el-card>
    <!-- echarts -->
    <div class="echart-container">
      <DashBoardItem
        v-for="(item, index) in dashBoardRenderList"
        :key="item.title"
        :title="item.title"
        :option="item.option"
        :type="item.type"
        :alert="alerts[index]"
      >
      </DashBoardItem>
    </div>
  </div>
</template>

<style lang="scss" scoped>
$dash-board-full-screen-width: 100%;
.dash-board-full-screen {
  width: $dash-board-full-screen-width;
  height: 100%;
  header {
    text-align: center;
  }
  .timeline-container {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    // padding: 10px;
    // border-radius: 10px;
    // margin-bottom: 10px;
    // box-shadow: 0px 12px 32px 4px rgba(0, 0, 0, 0.04),
    //   0px 8px 20px rgba(0, 0, 0, 0.08);
    // background-color: #fff;
  }
  .echart-container {
    width: 100%;
    box-sizing: border-box;
    display: flex;
    justify-content: space-around;
    gap: 10px;
  }
}
</style>
