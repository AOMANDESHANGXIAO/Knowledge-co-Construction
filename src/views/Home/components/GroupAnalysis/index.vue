<script lang="ts" setup>
/**
 * 小组分析应该包含
 * 1. 互动情况，也就是关系图。
 * 2. 哪个小组观点没有人关注。提醒大家去关注一下。
 */
import RelationShipGraph from '@/components/common/relationshipGraph/index.vue'
import { GetGroupInteractionResponse } from '@/apis/dataAnalysis'

defineOptions({
  name: 'index',
})

// 接收 props
const props = defineProps<{
  interactionData: GetGroupInteractionResponse | undefined
  notResponsedList: GetGroupInteractionResponse['notResponsed']
}>()

const emits = defineEmits<{
  (e: 'clickTag', id: string): void
}>()

const onClickTag = (id: string) => {
  // console.log('点击了标签', id)
  emits('clickTag', id)
}
</script>

<template>
  <div class="group-analysis-layout">
    <div class="relation-graph-container">
      <div class="main">
        <RelationShipGraph v-bind="props.interactionData"></RelationShipGraph>
      </div>
      <div class="footer">
        <n-h2>小组成员交互图</n-h2>
      </div>
    </div>
    <div class="attention-text-container">
      <n-h2 prefix="bar" type="info">未被关注的观点</n-h2>
      <n-text>你可以点击去访问该观点~</n-text>
      <div class="idea-pool-container">
        <n-tag
          v-if="props.notResponsedList.length > 0"
          v-for="(item, index) in notResponsedList"
          style="cursor: pointer"
          :color="{
            color: item.color,
            textColor: '#fff',
            borderColor: item.color,
          }"
          :key="index"
          @click="onClickTag(item.id)"
          >{{ item.name }}</n-tag
        >
        <div class="empty-container" v-else>
          <n-empty description="还未有观点出现~"></n-empty>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.empty-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
}
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
    padding: 10px;
    flex: 1;
    .idea-pool-container {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      border: 1px solid var(--normal-line-color);
      border-radius: 10px;
      padding: 10px;
      margin-top: 10px;
    }
  }
}
</style>
