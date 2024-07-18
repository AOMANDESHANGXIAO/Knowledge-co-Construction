<script lang="ts" setup>
defineOptions({
  name: 'RadarGraph',
})
import * as echarts from 'echarts/core'
import { TitleComponent, LegendComponent } from 'echarts/components'
import { RadarChart } from 'echarts/charts'
import { CanvasRenderer } from 'echarts/renderers'

echarts.use([TitleComponent, LegendComponent, RadarChart, CanvasRenderer])

const props = defineProps<Props>()

interface Props {
  Indicator: IndicatorItem[]
  LegendData: string[]
  SeriesData: SeriesDataItem[]
}

interface IndicatorItem {
  name: string
  max: number
}

interface SeriesDataItem {
  name: string
  value: Array<number>
}

const chartRef = ref<HTMLElement | null>(null)
const myChart = ref<echarts.ECharts | null>(null)
const option = computed(() => {
  return {
    darkMode: false,
    title: {
      text: '个人风格雷达图',
      textStyle: {
        color: '#fff',
      },
      bottom: 0,
      left: 0,
    },
    legend: {
      data: props.LegendData || ['Allocated Budget', '2', '3', '4', '5'],
      textStyle: {
        color: '#fff',
      },
      left: 0,
    },
    color: ['#4535C1', '#77E4C8', '#399918', '#EF5A6F', '#FF7F3E'],
    radar: {
      // shape: 'circle',
      indicator: props.Indicator || [
        { name: '发布', max: 6500 },
        { name: '支持', max: 16000 },
        { name: '反对', max: 30000 },
        { name: '总结', max: 38000 },
        { name: '修改', max: 52000 },
      ],
    },
    series: [
      {
        name: 'Budget vs spending',
        type: 'radar',
        data: props.SeriesData || [
          {
            value: [4200, 3000, 20000, 35000, 50000, 18000],
            name: 'Allocated Budget',
          },
          {
            value: [1200, 3000, 20000, 35000, 50000, 18000],
            name: '2',
          },
          {
            value: [4200, 1000, 20000, 35000, 50000, 18000],
            name: '3',
          },
          {
            value: [4200, 3000, 10000, 35000, 50000, 18000],
            name: '4',
          },
          {
            value: [4200, 3000, 20000, 35000, 5000, 18000],
            name: '5',
          },
        ],
      },
    ],
  }
})

const drawRadarGraph = () => {
  myChart.value?.dispose()
  myChart.value = echarts.init(chartRef.value!)
  option && myChart.value?.setOption(option.value)
}

const emits = defineEmits(['onReady'])

watch(
  () => props.SeriesData,
  () => {
    // console.log('props.SeriesData ===> ', props.SeriesData)
    drawRadarGraph()
  }
)

defineExpose({
  drawRadarGraph,
})
</script>

<template>
  <div class="radar-graph">
    <div class="echart-container" ref="chartRef"></div>
  </div>
</template>

<style lang="scss" scoped>
.radar-graph {
  width: 350px;
  height: 350px;
  .echart-container {
    width: 100%;
    height: 100%;
  }
}
</style>
