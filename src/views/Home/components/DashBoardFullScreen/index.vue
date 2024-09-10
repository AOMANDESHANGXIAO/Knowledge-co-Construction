<script lang="ts" setup>
/**
 * 全屏版的仪表盘
 */
import ECharts from '@/components/EChart/index.vue'
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


const testOption: ComposeOption<GraphSeriesOption> = {
  title: {
    text: '测试',
  },
  series: [
    {
      type: 'graph',
      layout: 'none',
      symbolSize: 50,
      roam: true,
      label: {
        show: true,
      },
      edgeSymbol: ['circle', 'arrow'],
      edgeSymbolSize: [10, 10],
      edgeLabel: {
        fontSize: 20,
      },
      data: [
        {
          name: 'Node 1',
          x: 300,
          y: 300,
        },
        {
          name: 'Node 2',
          x: 800,
          y: 300,
        },
        {
          name: 'Node 3',
          x: 550,
          y: 100,
        },
        {
          name: 'Node 4',
          x: 550,
          y: 500,
        },
      ],
      // links: [],
      links: [
        {
          source: 0,
          target: 1,
          symbolSize: [5, 20],
          label: {
            show: true,
          },
          lineStyle: {
            width: 5,
            curveness: 0.2,
          },
        },
        {
          source: 'Node 2',
          target: 'Node 1',
          label: {
            show: true,
          },
          lineStyle: {
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
const testRadarOption: ComposeOption<RadarSeriesOption> = {
  title: {
    text: '测试雷达图',
  },
}

const testBarOption: ComposeOption<BarSeriesOption> = {
  title: {
    text: '测试柱状图',
  },
}
</script>

<template>
  <div class="dash-board-full-screen">
    <DashBoardItem title="个人">
      <ECharts :option="testOption" type="graph"></ECharts>
    </DashBoardItem>
    <DashBoardItem title="互动">
      <ECharts :option="testRadarOption" type="radar"></ECharts>
    </DashBoardItem>
    <DashBoardItem title="团队">
      <ECharts :option="testBarOption" type="bar"></ECharts>
    </DashBoardItem>
  </div>
</template>

<style lang="scss" scoped>
$dash-board-full-screen-width: 100%;
.dash-board-full-screen {
  display: flex;
  justify-content: space-around;
  gap: 10px;
  width: $dash-board-full-screen-width;
  height: 60vh;
}
.dashboard-container {
  width: 300px;
  height: 300px;
}
</style>
