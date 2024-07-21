<script setup lang="ts">
import { ref } from 'vue'
import { VueFlow, Panel, useVueFlow } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import dataComponent from '../DataComponent/index.vue'
import conncetionComponent from '../ConnectionComponent/index.vue'
import WarrantComponent from '../WarrantComponent/index.vue'
import BackingComponent from '../BackingComponent/index.vue'
import ClaimComponent from '../ClaimComponent/index.vue'
import QualifierComponent from '../QualifierComponent/index.vue'
import RebuttalComponent from '../RebuttalComponent/index.vue'
import { useLayout } from '@/hooks/VueFlow/useLayout'
import { LayoutDirection } from './type.ts'
import '@vue-flow/controls/dist/style.css'

// these components are only shown as examples of how to use a custom node or edge
// you can find many examples of how to create these custom components in the examples page of the docs
// these are our nodes
const nodes = ref([
  // an input node, specified by using `type: 'input'`
  {
    id: 'data',
    type: 'data',
    position: { x: 0, y: 0 },
    // all nodes can have a data object containing any data you want to pass to the node
    // a label can property can be used for default nodes
    data: { label: 'Node 1' },
  },

  // default node, you can omit `type: 'default'` as it's the fallback type
  {
    id: 'connection-warrant', // 理据的连接点
    position: { x: 0, y: 0 },
    data: { label: 'Node 2' },
    type: 'conncetion',
  },
  {
    id: 'connection-qualifier', // 反驳的连接点
    position: { x: 0, y: 0 },
    data: { label: 'Node 2' },
    type: 'conncetion',
  },
  // An output node, specified by using `type: 'output'`
  {
    id: 'claim',
    type: 'claim', // <-- this is the custom node type name
    position: { x: 0, y: 0 },
    data: {
      label: 'Node 4',
      hello: 'world',
    },
  },
])

// these are our edges
const edges = ref([
  // default bezier edge
  // consists of an edge id, source node id and target node id
  {
    id: 'data-connect',
    source: 'data',
    target: 'connection-warrant',
  },
  {
    id: 'connect-connect',
    source: 'connection-warrant',
    target: 'connection-qualifier',
  },
  {
    id: 'connect-claim',
    source: 'connection-qualifier',
    target: 'claim',
  },
])

const { layout } = useLayout()

const { fitView } = useVueFlow()

async function layoutGraph(direction: LayoutDirection) {
  // 如果是上下排列的话要将nodes中的position属性做一个变换，将出去位置改为下
  // 将别人进来的位置改为上
  if (direction === LayoutDirection.Vertical) {
    nodes.value = nodes.value.map(node => {
      return {
        ...node,
      }
    })
  } else if (direction === LayoutDirection.Horizontal) {
    nodes.value = nodes.value.map(node => {
      return {
        ...node,
      }
    })
  }

  nodes.value = layout(nodes.value, edges.value, direction)

  await nextTick(() => {
    fitView()
  })
}

const { onPaneReady } = useVueFlow()

onPaneReady(() => {
  layoutGraph(LayoutDirection.Vertical)
})

const handleLayoutGraph = () => {
  layoutGraph(LayoutDirection.Vertical)
}

const handleAddWarrant = async () => {
  /**
   * 向连接点添加一个理据
   */
  const newWarrantNode = {
    id: 'warrant' + nodes.value.length,
    type: 'warrant',
    position: { x: 0, y: 0 },
    data: {
      nodeId: 'warrant' + nodes.value.length,
    },
  }

  const newEdge = {
    id: 'warrant-connect' + nodes.value.length,
    source: 'warrant' + nodes.value.length,
    target: 'connection-warrant',
  }

  nodes.value = [...nodes.value, newWarrantNode]
  edges.value = [...edges.value, newEdge]

  layoutGraph(LayoutDirection.Vertical).then(() => {
    handleLayoutGraph()
  })
  // await handleLayoutGraph()
}

interface AddBackPayload {
  nodeId: string
  inputValue: string
}

const handleAddBacking = (payload: AddBackPayload) => {
  const { nodeId, inputValue } = payload
  const newBackingNode = {
    id: 'backing' + nodes.value.length,
    type: 'backing',
    position: { x: 0, y: 0 },
  }
  const newEdge = {
    id: 'backing-connect' + nodes.value.length,
    source: 'backing' + nodes.value.length,
    target: nodeId,
  }

  nodes.value = [...nodes.value, newBackingNode]
  edges.value = [...edges.value, newEdge]

  layoutGraph(LayoutDirection.Vertical).then(() => {
    handleLayoutGraph()
  })
}
</script>

<template>
  <VueFlow :nodes="nodes" :edges="edges">
    <template #node-data>
      <data-component></data-component>
    </template>

    <template #node-conncetion>
      <conncetionComponent></conncetionComponent>
    </template>

    <template #node-warrant="props">
      <WarrantComponent :nodeId="props.data.nodeId" @addBacking="handleAddBacking"></WarrantComponent>
    </template>

    <template #node-backing>
      <BackingComponent></BackingComponent>
    </template>

    <template #node-claim>
      <ClaimComponent></ClaimComponent>
    </template>

    <template #node-qualifier>
      <QualifierComponent></QualifierComponent>
    </template>

    <template #node-rebuttal>
      <RebuttalComponent></RebuttalComponent>
    </template>

    <Background
      :variant="'lines'"
      :size="200"
      patternColor="#1a192b"
      :gap="180"
    />

    <Controls />

    <Panel position="top-right" class="button-group-container">
      <el-button
        plain
        style="margin-left: 0"
        color="#FF8225"
        @click="handleLayoutGraph"
        >自动布局</el-button
      >

      <el-button
        plain
        style="margin-left: 0"
        color="#88D66C"
        @click="handleAddWarrant"
        >加入理据</el-button
      >

      <el-button plain style="margin-left: 0" color="#EF5A6F"
        >添加支撑</el-button
      >

      <el-button plain style="margin-left: 0" color="#4535C1"
        >加限定词</el-button
      >
      <el-button plain style="margin-left: 0" color="#DC0083"
        >增加反驳</el-button
      >
    </Panel>
  </VueFlow>
</template>

<style>
/* import the necessary styles for Vue Flow to work */
@import '@vue-flow/core/dist/style.css';

/* import the default theme, this is optional but generally recommended */
@import '@vue-flow/core/dist/theme-default.css';

.button-group-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
  box-shadow: 0 0 2px 1px rgba(0, 0, 0, 0.08);
  padding: 10px;
  background-color: #fff;
}
</style>
