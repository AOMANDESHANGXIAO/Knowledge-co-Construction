<script setup lang="ts">
import { useUserStore } from '@/store/useUserStore.ts'
import ManageHeader from '@/components/common/manageHeader/index.vue'
import analysisItem from '@/components/common/analysisItem/index.vue'
import RadarGraph from '@/components/common/radarGraph/index.vue'
import relationshipGraph from '@/components/common/relationshipGraph/index.vue'
import { queryUserCollInfo } from '@/apis/user/index.ts'
import {
  selfAnalysisListItem,
  IndicatorItem,
  SeriesDataItem,
  LinksItem,
  RSSeriesDataItem,
} from '@/apis/user/type.ts'

const userStore = useUserStore()
const { userInfo } = userStore

const { id, group_id } = userInfo
const selfAnalysisList = ref<selfAnalysisListItem[]>([])
const Indicator = ref<IndicatorItem[]>([])
const LegendData = ref<string[]>([])
const SeriesData = ref<SeriesDataItem[]>([])
const RSSeriesData = ref<RSSeriesDataItem[]>([])
const LinksData = ref<LinksItem[]>([])
const radarRef = ref<typeof RadarGraph | null>(null)

if (group_id) {
  queryUserCollInfo(id, group_id).then(res => {
    if (res.success) {
      selfAnalysisList.value = res.data.selfAnalysisList
      Indicator.value = res.data.Indicator
      LegendData.value = res.data.LegendData
      SeriesData.value = res.data.SeriesData
      LinksData.value = res.data.LinksData
      RSSeriesData.value = res.data.RelationShipSeriesData
      // radarRef.value?.drawRadarGraph()
      // handleRadarOnReady()
    }
  })
}
</script>

<template>
  <div class="manage-page-my">
    <manage-header :username="userInfo.nickname"></manage-header>
    <section class="dashboard">
      <header style="font-size: 18px">这是您的个人协作风格分析</header>
      <el-divider></el-divider>
      <section class="analysis-container">
        <analysis-item
          v-for="item in selfAnalysisList"
          :key="item.iconName"
          :iconName="item.iconName"
          :text="item.text"
          :num="item.num"
        ></analysis-item>
      </section>
      <el-divider></el-divider>
      <section class="radar-graph-analysis">
        <radar-graph
          ref="radarRef"
          :Indicator="Indicator"
          :LegendData="LegendData"
          :SeriesData="SeriesData"
        ></radar-graph>
        <relationship-graph
          :SeriesData="RSSeriesData"
          :Links="LinksData"
        ></relationship-graph>
      </section>
    </section>
  </div>
</template>

<style scoped lang="scss">
@import '@/styles/mixin/layout.scss';

.manage-page-my {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  .dashboard {
    color: #fff;
    transform: translateY(-255px);
    width: calc(100% - 160px);
    margin: 0 auto;
    min-height: 400px;
    padding: 30px;
    border-radius: 30px;
    background-color: var(--dark-color);
  }
  .analysis-container {
    @include flex-gap-flex-evenly(30px);
  }
  .radar-graph-analysis {
    @include flex-gap-flex-evenly(30px);
  }
}
</style>
