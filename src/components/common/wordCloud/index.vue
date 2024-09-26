<template>
  <el-card v-bind="$attrs">
    <template #[slotName]="slotProps" v-for="(slot, slotName) in $slots">
      <slot :name="slotName" v-bind="slotProps"> </slot>
    </template>
    <div class="flex-center">
      <div
        class="flex-center"
        :style="`width: ${props.size.width}px; height: ${props.size.height}px`"
        ref="wordCloudDomRef"
      ></div>
    </div>
  </el-card>
</template>

<script lang="ts" setup>
import * as echarts from 'echarts'
import 'echarts-wordcloud'

// 定义类型
interface WordData {
  name: string
  id: string
  value: number
}

const props = withDefaults(
  defineProps<{
    wordList: WordData[]
    size?: {
      width: number
      height: number
    }
  }>(),
  {
    size: () => {
      return {
        width: 500,
        height: 250,
      }
    },
  }
)
const wordCloudDomRef = ref<HTMLElement | null>(null)
let wordCloudView: echarts.ECharts | null = null
let wordCloudOptions: echarts.EChartsOption = {}

onMounted(() => {
  drawWordCloudView()
  initViewData()
})

function drawWordCloudView() {
  if (wordCloudView) {
    wordCloudView.dispose()
  }

  wordCloudView = wordCloudDomRef.value && echarts.init(wordCloudDomRef.value)

  wordCloudView && wordCloudView.setOption(wordCloudOptions)
}

function initViewData() {
  const wordCloudSeries = [
    {
      type: 'wordCloud',
      shape: 'circle',
      left: 'center',
      clickable: true,
      top: 'center',
      width: '100%',
      height: '100%',
      right: null,
      bottom: null,
      sizeRange: [12, 50],
      rotationRange: [0, 0],
      rotationStep: 0,
      gridSize: 50,
      drawOutOfBound: false,
      layoutAnimation: true,
      textStyle: {
        fontFamily: 'sans-serif',
        fontWeight: 'bold',
        color: () => {
          return (
            'rgb(' +
            [
              Math.round(Math.random() * 255),
              Math.round(Math.random() * 255),
              Math.round(Math.random() * 255),
            ].join(',') +
            ')'
          )
        },
      },
      emphasis: {
        focus: 'self',
        textStyle: {
          shadowBlur: 5,
          shadowColor: '#F5F5F5',
        },
      },
      data: props.wordList,
    },
  ]
  wordCloudOptions = {
    series: wordCloudSeries as echarts.EChartsOption['series'],
  }
  wordCloudView?.setOption(wordCloudOptions)
  // 绑定点击事件
  wordCloudView?.on('click', (params: any) => {
    getItemInfo(params.data.id)
  })
}

function getItemInfo(id: string) {
  console.log('---', id)
}
</script>

<style scoped>
.flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
