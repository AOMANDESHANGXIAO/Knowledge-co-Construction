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
import WordCloud from '@/components/common/wordCloud/index.vue'
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
const wordList = [
  {
    name: '十九大精神',
    id: '123',
    value: 15000,
  },
  {
    name: '两学一做',
    id: '123',
    value: 10081,
  },
  {
    name: '中华民族',
    id: '123',
    value: 9386,
  },
  {
    name: '马克思主义',
    id: '123',
    value: 7500,
  },
  {
    name: '民族复兴',
    id: '123',
    value: 7500,
  },
  {
    name: '社会主义制度',
    id: '123',
    value: 6500,
  },
  {
    name: '国防白皮书',
    id: '123',
    value: 6500,
  },
  {
    name: '创新',
    id: '123',
    value: 6000,
  },
  {
    name: '民主革命',
    id: '123',
    value: 4500,
  },
  {
    name: '文化强国',
    id: '123',
    value: 3800,
  },
  {
    name: '国家主权',
    id: '123',
    value: 3000,
  },
  {
    name: '武装颠覆',
    id: '123',
    value: 2500,
  },
  {
    name: '领土完整',
    id: '123',
    value: 2300,
  },
  {
    name: '安全',
    id: '123',
    value: 2000,
  },
  {
    name: '从严治党',
    id: '123',
    value: 1900,
  },
  {
    name: '现代化经济体系',
    id: '123',
    value: 1800,
  },
  {
    name: '国防动员',
    id: '123',
    value: 1700,
  },
  {
    name: '信息化战争',
    id: '123',
    value: 1600,
  },
  {
    name: '局部战争',
    id: '123',
    value: 1500,
  },
  {
    name: '教育',
    id: '123',
    value: 1200,
  },
  {
    name: '职业教育',
    id: '123',
    value: 1100,
  },
  {
    name: '兵法',
    id: '123',
    value: 900,
  },
  {
    name: '一国两制',
    id: '123',
    value: 800,
  },
  {
    name: '特色社会主义思想',
    id: '123',
    value: 700,
  },
]
</script>

<template>
  <div class="dash-board-full-screen">
    <header>
      <n-gradient-text type="success" :font-size="30">
        学习分析仪表盘详情
      </n-gradient-text>
    </header>
    <n-tabs type="segment" animated>
      <n-tab-pane name="组内分析">
        <section class="card-container">
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
        </section>
      </n-tab-pane>
      <n-tab-pane name="组间分析">
        <WordCloud :word-list="wordList">
          <template #header>
            词云
          </template>
          <template #footer>
            来自小组: 牛魔
          </template>
        </WordCloud>
      </n-tab-pane>
    </n-tabs>
  </div>
</template>

<style lang="scss" scoped>
$dash-board-full-screen-width: 100%;
.dash-board-full-screen {
  width: $dash-board-full-screen-width;
  height: 100%;
  header {
    text-align: center;
    height: 60px;
  }
  .card-container {
    height: calc(100% - 30px);
    width: 100%;
  }
  .timeline-container {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
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
