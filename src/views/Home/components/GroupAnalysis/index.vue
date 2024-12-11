<script lang="ts" setup>
/**
 * 小组分析应该包含
 * 1. 互动情况，也就是关系图。
 * 2. 哪个小组观点没有人关注。提醒大家去关注一下。
 */
import RelationShipGraph from '@/components/common/relationshipGraph/index.vue'
import {
  DataAnalysisAPI,
  GetGroupInteractionResponse,
} from '@/apis/dataAnalysis'
import useRequest from '@/hooks/Async/useRequest'
import useQueryParam from '@/hooks/router/useQueryParam'
import { useUserStore } from '@/store/modules/user'

defineOptions({
  name: 'index',
})

const topic_id = useQueryParam('topic_id')
const { getOneUserInfo } = useUserStore()
const groupId = getOneUserInfo<string>('group_id')
const interactionData = ref<GetGroupInteractionResponse>()

useRequest({
  apiFn: async () => {
    return DataAnalysisAPI.getGroupInteractionData({
      topic_id: topic_id.value,
      group_id: groupId,
    })
  },
  onSuccess(data: GetGroupInteractionResponse) {
    interactionData.value = data
  },
  immediate: true,
})
</script>

<template>
  <div class="group-analysis-layout">
    <div class="relation-graph-container">
      <div class="main">
        <RelationShipGraph v-bind="interactionData"></RelationShipGraph>
      </div>
      <div class="footer">
        <n-h2>小组交互图</n-h2>
      </div>
    </div>
    <div class="attention-text-container">
      <p>请关注一下哪些小组的观点没有被关注</p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.group-analysis-layout {
  width: 100%;
  height: 100%;
  background: var(--light-bgc-white);
  padding: 10px;
  display: flex;
  gap: 10px;
  .relation-graph-container {
    background-color: #fff;
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 10px;
    .main {
      flex: 5;
    }
    .footer {
      flex: 1;
      border-top: 1px solid var(--normal-line-color);
      padding-top: 10px;
      text-align: center;
    }
  }
  .attention-text-container {
    background-color: #fff;
    flex: 1;
  }
}
</style>
