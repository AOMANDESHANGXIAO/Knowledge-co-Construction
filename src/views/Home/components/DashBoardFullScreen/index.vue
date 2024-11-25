<script lang="ts" setup>
/**
 * 全屏版的仪表盘
 */
import DashBoardItem from './components/index.vue'
import type { ComposeOption } from 'echarts/core'
import type { QueryWordCloudResult } from '@/apis/flow/index'
import type {
  // 系列类型的定义后缀都为 SeriesOption
  BarSeriesOption,
  RadarSeriesOption,
  GraphSeriesOption,
} from 'echarts/charts'
import WordCloudUI from './components/WordCloudUI/index.vue'
import _ from 'lodash'
defineOptions({
  name: 'dash-board-full-screen',
})

type WordCloudDataSetItem = {
  name: string
  value: number
}

const props = withDefaults(
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
    wordCloudTextList?: QueryWordCloudResult['list']
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
    wordCloudTextList: () => [] as QueryWordCloudResult['list'],
  }
)
const getCloudWordData = inject('getCloudWordData') as () => void
const SHOW_WORD_COUNT = 15
const generateWordCloudList = (text: string): WordCloudDataSetItem[] => {
  const list: WordCloudDataSetItem[] = []
  const segmenter: {
    segment: string
    index: number
    input: string
    isWordLike: Boolean
  }[] = Array.from(
    // @ts-ignore
    new Intl.Segmenter('cn', { granularity: 'word' }).segment(text)
  )
  const wordCounts = _.countBy(
    segmenter.filter(item => item.segment.length > 1),
    'segment'
  )

  for (const key in wordCounts) {
    list.push({
      name: key,
      value: wordCounts[key],
    })
  }
  return _.orderBy(list, ['value'], ['desc']).slice(0, SHOW_WORD_COUNT)
}
const BASE_WAIT_TIME = 50
const getWaitTime = (index: number) => {
  return (index + 1) * BASE_WAIT_TIME
}
const paneNames = {
  wordCloudText: '🌤️词云分析🌤️',
  innerGroupAnalysis: '👯组内分析👯',
}
const handleGetWordCloudContent = (name: string) => {
  console.log('点击le', name)
  if (
    name === paneNames.wordCloudText &&
    props.wordCloudTextList.length === 0
  ) {
    getCloudWordData && getCloudWordData()
  }
}
</script>

<template>
  <div class="dash-board-full-screen">
    <header>
      <n-gradient-text type="success" :font-size="30">
        学习分析仪表盘详情
      </n-gradient-text>
    </header>
    <n-tabs type="segment" animated @update:value="handleGetWordCloudContent">
      <n-tab-pane :name="paneNames.innerGroupAnalysis">
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
      <n-tab-pane :name="paneNames.wordCloudText">
        <div
          style="width: 500px; max-width: 500px; margin-top: 10px"
          v-for="(item, index) in wordCloudTextList"
          :key="item.group_name"
        >
          <WordCloudUI
            :dataset="generateWordCloudList(item.text)"
            :wait-time="getWaitTime(index)"
            :title="item.group_name"
          />
        </div>
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
:deep(.n-tab-pane) {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
</style>
