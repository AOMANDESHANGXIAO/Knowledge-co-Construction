<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'
import { GroupNodeProps } from './type.ts'
import { ref } from 'vue'
import NodePopover from '@/components/NodePopover/index.vue'
import { useElementSize } from '@vueuse/core'

interface Props {
  data: GroupNodeProps
}

const props = withDefaults(defineProps<Props>(), {
  data: () => ({
    groupName: '小组A',
    groupConclusion: '暂时没有讨论结果...',
    bgc: '#FFA62F',
    sourcePosition: Position.Bottom, // 出来
    targetPosition: Position.Top, // 进来
  }),
})

const containerRef = ref<HTMLElement | null>(null)

const { width, height } = useElementSize(containerRef)

const handleClick = () => {
  console.log('click')
  isShow.value = !isShow.value
}

const isShow = ref(false)
</script>

<template>
  <div class="container" @click="handleClick" ref="containerRef">
    <Handle type="target" :position="props.data.targetPosition" />
    <Handle type="source" :position="props.data.sourcePosition" />
    <div class="title" :style="{ backgroundColor: props.data.bgc }">
      {{ props.data.groupName }}
    </div>
    <div class="content">
      <el-text>{{ props.data.groupConclusion }}</el-text>
    </div>
    <NodePopover :is-show="isShow" :offset-width="width" :offset-height="height">
      <div>123</div>
    </NodePopover>
  </div>
</template>

<style scoped lang="scss">
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
    //background-color: #67c23a;
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
}
</style>
