<script setup lang='ts'>
import { Position, Handle } from '@vue-flow/core'
import { TopicNodeProps } from './type.ts'

interface Props {
 data: TopicNodeProps
}

const props = withDefaults(defineProps<Props>(), {
  data: () => {
    return {
      text: 'Node Special',
      sourcePosition: Position.Bottom,
      targetPosition: Position.Top
    }
  }
})

const handleClick = () => {
  console.log('click')
}
</script>

<template>
  <div class="container" @click="handleClick">
    <Handle type="target" :position="props.data.targetPosition"/>
    <Handle type="source" :position="props.data.sourcePosition"/>
    <div class="title">😯讨论话题😯</div>
    <div class="content">
      <el-text>{{props.data.text}}</el-text>
    </div>
  </div>
</template>

<style scoped lang="scss">
.container {
  width: 180px;
  border-radius: 10px;
  background-color:#F3F7EC;
  &:hover {
    background-color: darken(#F3F7EC, 10%);
  }
  .title {
    width: 100%;
    height: 40px;
    line-height: 40px;
    text-align: center;
    color: #f9f9f9;
    background-color: #67c23a;
  }
  .content {
    width: 100%;
    max-height: 300px;
    overflow: hidden;
    padding: 10px;
    font-size: 20px;
    color: #242424;
  }
}
</style>