<script setup lang="ts">
import useGraph from "@/views/Demo/useGraph.ts";
import { graphOptions } from "@/views/Demo/graphOption.ts";

const data = {
  // 节点
  nodes: [
    {
      id: 'node1', // String，可选，节点的唯一标识
      x: 40,       // Number，必选，节点位置的 x 值
      y: 40,       // Number，必选，节点位置的 y 值
      width: 80,   // Number，可选，节点大小的 width 值
      height: 40,  // Number，可选，节点大小的 height 值
      label: 'hello', // String，节点标签
    },
    {
      id: 'node2', // String，节点的唯一标识
      x: 160,      // Number，必选，节点位置的 x 值
      y: 180,      // Number，必选，节点位置的 y 值
      width: 80,   // Number，可选，节点大小的 width 值
      height: 40,  // Number，可选，节点大小的 height 值
      label: 'world', // String，节点标签
    },
  ],
  // 边
  edges: [
    {
      source: 'node1', // String，必须，起始节点 id
      target: 'node2', // String，必须，目标节点 id
    },
  ],
  graphOptions
};
const { container } = useGraph(data)

const handleProposeIdea = () => {
  console.log('handleProposeIdea')
}
</script>

<template>
  <n-flex align="flex-start">
    <n-float-button-group shape="square" position="fixed" style="bottom: 80px;right: 20px;z-index:10">
      <n-float-button  width="200">刷新页面</n-float-button>
      <n-float-button  width="200">提出问题</n-float-button>
      <n-float-button  width="200" @click="handleProposeIdea">新建观点</n-float-button>
      <n-float-button  width="200">提交请求</n-float-button>
      <n-float-button  width="200">总结观点</n-float-button>
    </n-float-button-group>
  </n-flex>
  <div ref="container" style="width: 100vw;height: 100vh"></div>
</template>

<style scoped lang="scss">

</style>