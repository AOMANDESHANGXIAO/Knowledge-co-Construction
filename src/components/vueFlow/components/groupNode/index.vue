<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'
import { GroupNodeProps } from '@/components/vueFlow/components/groupNode/type.ts'
defineOptions({
  name: 'groupNode',
})

interface Props {
  data: GroupNodeProps
}

const props = withDefaults(defineProps<Props>(), {
  data: () => {
    return {
      groupName: 'No Group Name',
      groupConclusion: '暂时没有讨论结果...',
      bgc: '#FFA62F',
      group_id: -1,
      node_id: '', // node_id
      sourcePosition: Position.Bottom, // 出来
      targetPosition: Position.Top, // 进来
    }
  },
})

const emits = defineEmits<{
  // 将group_id传给父组件
  (
    e: 'onClickGroupNode',
    payload: { groupId: string; nodeId: string; groupConclusion: string }
  ): void
}>()

const handleClick = () => {
  emits('onClickGroupNode', {
    groupId: String(props.data.group_id),
    nodeId: String(props.data.node_id),
    groupConclusion: props.data.groupConclusion,
  })
}
</script>

<template>
  <div class="container">
    <Handle type="target" :position="props.data.targetPosition" />
    <Handle type="source" :position="props.data.sourcePosition" />
    <div class="title" :style="{ backgroundColor: props.data.bgc }">
      {{ props.data.groupName }}
    </div>
    <div class="content" @click="handleClick">
      <el-text>{{
        props.data.groupConclusion || '暂时没有讨论结果...'
      }}</el-text>
    </div>
  </div>
</template>

<style scoped>
.container {
  width: 180px;
  border-radius: 10px;
  background-color: #f3f7ec;
  position: relative;

  &:hover {
    background-color: darken(#f3f7ec, 10%);
  }

  .title {
    width: 100%;
    height: 40px;
    line-height: 40px;
    text-align: center;
    color: #f9f9f9;
  }

  .content {
    width: 100%;
    max-height: 300px;
    overflow: hidden;
    padding: 10px;
    font-size: 20px;
    color: #242424;
    text-overflow: ellipsis;
    -webkit-line-clamp: 3;
    display: -webkit-box;
    -webkit-box-orient: vertical;
  }
  :deep(.el-button) {
    width: 100%;
  }
}
</style>
