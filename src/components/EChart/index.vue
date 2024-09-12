<script lang="ts" setup>
import * as echarts from 'echarts/core'
import { BarChart, LineChart, GraphChart, RadarChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  // 数据集组件
  DatasetComponent,
  // 内置数据转换器组件 (filter, sort)
  TransformComponent,
  LegendComponent,
} from 'echarts/components'
import { LabelLayout, UniversalTransition } from 'echarts/features'
import { CanvasRenderer, SVGRenderer } from 'echarts/renderers'
import type {
  // 系列类型的定义后缀都为 SeriesOption
  BarSeriesOption,
  LineSeriesOption,
  GraphSeriesOption,
  RadarSeriesOption,
} from 'echarts/charts'
import type {
  // 组件类型的定义后缀都为 ComponentOption
  TitleComponentOption,
  TooltipComponentOption,
  GridComponentOption,
  DatasetComponentOption,
  GraphicComponentOption,
} from 'echarts/components'
import type { ComposeOption } from 'echarts/core'
import {
  GRAPH_DEFAULT_OPTION,
  RADAR_DEFAULT_OPTION,
  BAR_DEFAULT_OPTION,
} from './option'

// 通过 ComposeOption 来组合出一个只有必须组件和图表的 Option 类型
type ECOption = ComposeOption<
  | GraphSeriesOption
  | BarSeriesOption
  | LineSeriesOption
  | TitleComponentOption
  | TooltipComponentOption
  | GridComponentOption
  | DatasetComponentOption
  | GraphicComponentOption
  | RadarSeriesOption
>

// 注册必须的组件
echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DatasetComponent,
  TransformComponent,
  BarChart,
  LineChart,
  LabelLayout,
  UniversalTransition,
  CanvasRenderer,
  GraphChart,
  LegendComponent,
  RadarChart,
  SVGRenderer,
])
const props = defineProps<{
  type?: 'graph' | 'radar' | 'bar'
  option?: ECOption
  size: {
    width: number
    height: number
  }
}>()

defineOptions({
  name: 'EchartComponent',
})

const chartRef = ref<HTMLElement | null>(null)
const myChart = ref<echarts.ECharts | null>(null)

const optionMap = {
  graph: GRAPH_DEFAULT_OPTION,
  radar: RADAR_DEFAULT_OPTION,
  bar: BAR_DEFAULT_OPTION,
}

const getOption = () => {
  const { type, option } = props
  if (!type || !option) return
  if (Object.keys(optionMap).includes(type)) {
    return {
      ...optionMap[type],
      ...option,
    }
  } else {
    console.warn('未配置类型图表')
    return
  }
}

const draw = () => {
  const option = getOption()
  if (!option) {
    console.warn('EChartComponent: 未配置类型图表')
  }

  if (myChart.value) {
    myChart.value.dispose()
  }
  myChart.value = echarts.init(chartRef.value!, null, {
    renderer: 'svg',
    width: props.size.width,
    height: props.size.height,
  })
  option && myChart.value?.setOption(option)
}

onMounted(() => {
  draw()
})

onUpdated(() => {
  draw()
})

watch(
  () => props.option,
  () => {
    chartRef.value && draw()
  }
)
</script>

<template>
  <div ref="chartRef" class="echart-container"></div>
</template>

<style lang="scss" scoped>
.echart-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  position: relative;
  margin: auto;
}
</style>
