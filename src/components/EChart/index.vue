<script lang="ts" setup>
import * as echarts from 'echarts/core'
import { BarChart, LineChart, GraphChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  // 数据集组件
  DatasetComponent,
  // 内置数据转换器组件 (filter, sort)
  TransformComponent,
} from 'echarts/components'
import { LabelLayout, UniversalTransition } from 'echarts/features'
import { CanvasRenderer } from 'echarts/renderers'
import type {
  // 系列类型的定义后缀都为 SeriesOption
  BarSeriesOption,
  LineSeriesOption,
  GraphSeriesOption,
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
import { GRAPH_DEFAULT_OPTION } from './option'

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
])
const props = defineProps<{
  type: 'graph'
  option: ECOption
}>()

defineOptions({
  name: 'EchartComponent',
})

const chartRef = ref<HTMLElement | null>(null)
const myChart = ref<echarts.ECharts | null>(null)

const optionMap = {
  graph: GRAPH_DEFAULT_OPTION,
}

const getOption = () => {
  const { type, option } = props
  if (Object.keys(optionMap).includes(type)) {
    return {
      ...optionMap[type],
      ...option,
    }
  } else {
    console.warn('未配置类型图表')
    return option
  }
}

const draw = () => {
  const option = getOption()
  if (myChart.value) {
    myChart.value.dispose()
  }
  myChart.value = echarts.init(chartRef.value!)
  option && myChart.value?.setOption(option)
}

onMounted(() => {
  draw()
})

watch(
  () => props.option,
  () => {
    myChart.value && draw()
  }
)
</script>

<template>
  <div ref="chartRef"></div>
</template>

<style lang="scss" scoped></style>
