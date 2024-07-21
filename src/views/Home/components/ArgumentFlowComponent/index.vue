<script setup lang="ts">
import { ref } from 'vue'
import { VueFlow, Panel } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import dataComponent from '../DataComponent/index.vue'
import conncetionComponent from '../ConnectionComponent/index.vue'
import WarrantComponent from '../WarrantComponent/index.vue'
import BackingComponent from '../BackingComponent/index.vue'
import ClaimComponent from '../ClaimComponent/index.vue'
import QualifierComponent from '../QualifierComponent/index.vue'
import RebuttalComponent from '../RebuttalComponent/index.vue'
import '@vue-flow/controls/dist/style.css'

// these components are only shown as examples of how to use a custom node or edge
// you can find many examples of how to create these custom components in the examples page of the docs
// these are our nodes
const nodes = ref([
  // an input node, specified by using `type: 'input'`
  {
    id: '1',
    type: 'data',
    position: { x: 250, y: 5 },
    // all nodes can have a data object containing any data you want to pass to the node
    // a label can property can be used for default nodes
    data: { label: 'Node 1' },
  },

  // default node, you can omit `type: 'default'` as it's the fallback type
  {
    id: '2',
    position: { x: 100, y: 100 },
    data: { label: 'Node 2' },
    type: 'conncetion',
  },
  {
    id: '3',
    position: { x: 100, y: 200 },
    data: { label: 'Node 2' },
    type: 'conncetion',
  },
  // An output node, specified by using `type: 'output'`
  {
    id: '4',
    type: 'warrant',
    position: { x: 400, y: 200 },
    data: { label: 'Node 3' },
  },

  // this is a custom node
  // we set it by using a custom type name we choose, in this example `special`
  // the name can be freely chosen, there are no restrictions as long as it's a string
  {
    id: '5',
    type: 'backing', // <-- this is the custom node type name
    position: { x: 400, y: 200 },
    data: {
      label: 'Node 4',
      hello: 'world',
    },
  },
  {
    id: '6',
    type: 'claim', // <-- this is the custom node type name
    position: { x: 600, y: 400 },
    data: {
      label: 'Node 4',
      hello: 'world',
    },
  },
  {
    id: '7',
    type: 'rebuttal', // <-- this is the custom node type name
    position: { x: 800, y: 400 },
    data: {
      label: 'Node 4',
      hello: 'world',
    },
  },
  {
    id: '8',
    type: 'qualifier', // <-- this is the custom node type name
    position: { x: 800, y: 400 },
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
    id: 'e1->2',
    source: '1',
    target: '2',
  },

  // set `animated: true` to create an animated edge path
  {
    id: 'e2->3',
    source: '2',
    target: '3',
    animated: true,
  },
  {
    id: 'e4->2',
    source: '2',
    target: '3',
    animated: true,
  },

  // a custom edge, specified by using a custom type name
  // we choose `type: 'special'` for this example
  {
    id: 'e3->4',
    source: '3',
    target: '4',

    // all edges can have a data object containing any data you want to pass to the edge
    data: {
      hello: 'world',
    },
  },
  {
    id: 'e4->5',
    source: '4',
    target: '5',

    // all edges can have a data object containing any data you want to pass to the edge
    data: {
      hello: 'world',
    },
  },
  {
    id: 'e5->6',
    source: '5',
    target: '6',

    // all edges can have a data object containing any data you want to pass to the edge
    data: {
      hello: 'world',
    },
  },
  {
    id: 'e6->7',
    source: '6',
    target: '7',

    // all edges can have a data object containing any data you want to pass to the edge
    data: {
      hello: 'world',
    },
  },
  {
    id: 'e7->8',
    source: '7',
    target: '8',

    // all edges can have a data object containing any data you want to pass to the edge
    data: {
      hello: 'world',
    },
  },
])
</script>

<template>
  <VueFlow :nodes="nodes" :edges="edges">
    <template #node-data>
      <data-component></data-component>
    </template>

    <template #node-conncetion>
      <conncetionComponent></conncetionComponent>
    </template>

    <template #node-warrant>
      <WarrantComponent></WarrantComponent>
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
      <el-button plain style="margin-left: 0" color="#FF8225"
        >添加前提</el-button
      >
      <el-button plain style="margin-left: 0" color="#EF5A6F"
        >添加支撑</el-button
      >
      <el-button plain style="margin-left: 0" color="#88D66C"
        >加入理据</el-button
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
