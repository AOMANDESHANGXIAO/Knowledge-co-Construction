import type { GraphSeriesOption } from 'echarts/charts'
import type { ComposeOption } from 'echarts/core'
const RADAR = {
  indicator: [
    { text: 'Indicator1' },
    { text: 'Indicator2' },
    { text: 'Indicator3' },
    { text: 'Indicator4' },
    { text: 'Indicator5' },
  ],
  center: ['25%', '50%'],
  radius: 120,
  startAngle: 90,
  splitNumber: 4,
  shape: 'circle',
  axisName: {
    formatter: '【{value}】',
    color: '#428BD4',
  },
  splitArea: {
    areaStyle: {
      color: ['#77EADF', '#26C3BE', '#64AFE9', '#428BD4'],
      shadowColor: 'rgba(0, 0, 0, 0.2)',
      shadowBlur: 10,
    },
  },
  axisLine: {
    lineStyle: {
      color: 'rgba(211, 253, 250, 0.8)',
    },
  },
  splitLine: {
    lineStyle: {
      color: 'rgba(211, 253, 250, 0.8)',
    },
  },
}

/**
 * 默认的关系图配置
 */
const GRAPH_DEFAULT_OPTION: ComposeOption<GraphSeriesOption> = {
  title: {
    text: 'Basic Graph',
  },
  tooltip: {},
  animationDurationUpdate: 1500,
  animationEasingUpdate: 'quinticInOut',
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
      edgeSymbolSize: [4, 10],
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

export { RADAR, GRAPH_DEFAULT_OPTION }
