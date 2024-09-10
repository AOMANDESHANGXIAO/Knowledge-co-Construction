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
import { queryDashBoard } from '@/apis/flow'
import { QueryDashBoardResponse } from '@/apis/flow/type'
import useRequest from '@/hooks/Async/useRequest'
import useQueryParam from '@/hooks/router/useQueryParam'
import { useUserStore } from '@/store/modules/user/index'
import useState from '@/hooks/State/useState'

defineOptions({
  name: 'dash-board-full-screen',
})

const testBarOption: ComposeOption<BarSeriesOption> = {
  title: {
    text: '测试柱状图',
  },
}

const { getOneUserInfo } = useUserStore()
const topicId = useQueryParam<number>('topic_id')

const [dashBoardData, setDashBoardData] = useState<{
  radar: ComposeOption<RadarSeriesOption>
  graph: ComposeOption<GraphSeriesOption>
}>({
  radar: {},
  graph: {},
})

/**
 * 查询仪表盘
 */
useRequest({
  apiFn: async () => {
    console.log('student_id', getOneUserInfo('id'))
    console.log('group_id', getOneUserInfo('group_id'))
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
    })
  },
  immediate: true,
})
</script>

<template>
  <div class="dash-board-full-screen">
    <DashBoardItem title="论证元素">
      <ECharts :option="dashBoardData.radar" type="radar"></ECharts>
    </DashBoardItem>
    <DashBoardItem title="互动">
      <ECharts :option="dashBoardData.graph" type="graph"></ECharts>
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
