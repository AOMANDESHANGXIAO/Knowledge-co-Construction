<script lang="ts" setup>
defineOptions({
  name: 'relationshipGraph',
})
import * as echarts from 'echarts/core'
import { TitleComponent, TooltipComponent } from 'echarts/components'
import { GraphChart } from 'echarts/charts'
import { CanvasRenderer } from 'echarts/renderers'

echarts.use([TitleComponent, TooltipComponent, GraphChart, CanvasRenderer])

const chartRef = ref<HTMLElement | null>(null)
const myChart = ref()

interface SeriesDataItem {
  name: string
}

interface LinksItem {
  source: number | string
  target: number | string
  symbolSize?: number[]
  label?: {
    show: boolean
  }
  lineStyle?: {
    width: number
  }
}

interface Props {
  SeriesData: SeriesDataItem[]
  Links: LinksItem[]
}

const props = defineProps<Props>()

const option = computed(() => {
  return {
    title: {
      text: '与其他小组成员关系图',
      textStyle: {
        color: '#fff',
      },
      bottom: 0,
      left: 0,
    },
    tooltip: {},
    animationDurationUpdate: 1500,
    animationEasingUpdate: 'quinticInOut',
    color: ['#4535C1', '#77E4C8', '#399918', '#EF5A6F', '#FF7F3E'],
    series: [
      {
        type: 'graph',
        layout: 'circular',
        symbolSize: 50,
        roam: true,
        label: {
          show: true,
        },
        edgeSymbol: ['none', 'none'],
        edgeSymbolSize: [4, 10],
        edgeLabel: {
          fontSize: 20,
        },
        data: props.SeriesData || [
          {
            name: 'Node 1',
            itemStyle: {
              color: '#77E4C8',
            },
          },
          {
            name: 'Node 2',
          },
          {
            name: 'Node 3',
          },
          {
            name: 'Node 4',
          },
        ],
        // links: [],
        links: props.Links || [
          {
            source: 0,
            target: 1,
            symbolSize: [5, 20],
            label: {
              show: false,
            },
            lineStyle: {
              width: 15,
              curveness: 0.2,
            },
          },
          {
            source: 'Node 1',
            target: 'Node 3',
          },
          {
            source: 'Node 2',
            target: 'Node 3',
          },
          {
            source: 'Node 2',
            target: 'Node 4',
          },
          {
            source: 'Node 1',
            target: 'Node 4',
          },
        ],
        lineStyle: {
          opacity: 0.9,
          width: 2,
          curveness: 0,
        },
      },
    ],
  }
})

const drawRadarGraph = () => {
  myChart.value?.dispose()
  myChart.value = echarts.init(chartRef.value!)
  option && myChart.value?.setOption(option.value)
}

watch(
  () => props.SeriesData,
  () => {
    drawRadarGraph()
  }
)
</script>

<template>
  <div class="relationship-graph">
    <div class="echart-container" ref="chartRef"></div>
  </div>
</template>

<style lang="scss" scoped>
.relationship-graph {
  width: 350px;
  height: 350px;
  .echart-container {
    width: 100%;
    height: 100%;
  }
}
</style>
