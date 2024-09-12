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
import { queryDashBoard } from '@/apis/flow'
import { QueryDashBoardResponse } from '@/apis/flow/type'
import useRequest from '@/hooks/Async/useRequest'
import useQueryParam from '@/hooks/router/useQueryParam'
import { useUserStore } from '@/store/modules/user/index'
import useState from '@/hooks/State/useState'
import useEvaluation from '../../hooks/useEvaluation'

defineOptions({
  name: 'dash-board-full-screen',
})

const { getOneUserInfo } = useUserStore()
const topicId = useQueryParam<number>('topic_id')

const [dashBoardData, setDashBoardData] = useState<{
  radar: ComposeOption<RadarSeriesOption>
  graph: ComposeOption<GraphSeriesOption>
  bar: ComposeOption<BarSeriesOption>
}>({
  radar: {},
  graph: {},
  bar: {},
})

/**
 * 查询仪表盘
 */
useRequest({
  apiFn: async () => {
    return await queryDashBoard({
      topic_id: topicId.value,
      student_id: getOneUserInfo('id'),
      group_id: getOneUserInfo('group_id'),
    })
  },
  onSuccess(response: QueryDashBoardResponse) {
    setDashBoardData({
      radar: {
        ...response.radarOption,
      },
      graph: {
        ...response.graphOption,
      },
      bar: {
        ...response.barOption,
      },
    })
  },
  immediate: true,
})

const evaluationData = computed(() => {
  return {
    argumentData: dashBoardData.value.radar,
    interactionData: dashBoardData.value.graph,
    groupData: dashBoardData.value.bar,
  }
})

// @ts-ignore
const { evaluatedArgument, evaluatedInteraction, evaluatedGroupContribution } =
  useEvaluation(evaluationData) // @ts-ignore

const dashBoardRenderList = computed<
  Array<{
    title: string
    option:
      | ComposeOption<BarSeriesOption>
      | ComposeOption<GraphSeriesOption>
      | ComposeOption<RadarSeriesOption>
    type: 'radar' | 'graph' | 'bar'
    alert: {
      title: string
      type: 'info' | 'success' | 'warning' | 'error'
      suggestions: string[]
    }
  }>
>(() => {
  return [
    {
      title: '论证元素',
      option: dashBoardData.value.radar,
      type: 'radar',
      alert: evaluatedArgument.value,
    },
    {
      title: '互动',
      option: dashBoardData.value.graph,
      type: 'graph',
      alert: evaluatedInteraction.value,
    },
    {
      title: '团队',
      option: dashBoardData.value.bar,
      type: 'bar',
      alert: evaluatedGroupContribution.value,
    },
  ]
})
</script>

<template>
  <div class="dash-board-full-screen">
    <DashBoardItem
      v-for="item in dashBoardRenderList"
      :key="item.title"
      :title="item.title"
      :option="item.option"
      :type="item.type"
      :alert="item.alert"
    >
    </DashBoardItem>
  </div>
</template>

<style lang="scss" scoped>
$dash-board-full-screen-width: 100%;
.dash-board-full-screen {
  box-sizing: border-box;
  display: flex;
  justify-content: space-around;
  gap: 10px;
  width: $dash-board-full-screen-width;
  height: 100%;
}
</style>
