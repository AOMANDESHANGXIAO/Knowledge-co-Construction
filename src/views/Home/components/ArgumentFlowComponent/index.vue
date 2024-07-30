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
import type { NodeType, EdgeType, AddBackPayload } from './type.ts'
import { LayoutDirection } from './type.ts'
import '@vue-flow/controls/dist/style.css'

const nodes = ref<NodeType[]>([
  {
    id: 'data',
    type: 'data',
    position: { x: 0, y: 0 },
    data: {
      inputValue: '',
    },
  },
  {
    id: 'claim',
    type: 'claim',
    position: { x: 0, y: 0 },
    data: {
      inputValue: '',
    },
  },
])

// these are our edges
const edges = ref<EdgeType[]>([
  // default bezier edge
  // consists of an edge id, source node id and target node id
  {
    id: 'init-data-claim',
    source: 'data',
    target: 'claim',
    _type: 'data',
  },
])

// 将来做成异步的请求Nodes和Edges

const { layout } = useLayout()

const { fitView, findNode } = useVueFlow()

async function layoutGraph(direction: LayoutDirection) {
  // 如果是上下排列的话要将nodes中的position属性做一个变换，将出去位置改为下
  // 将别人进来的位置改为上
  // if (direction === LayoutDirection.Vertical) {
  //   nodes.value = nodes.value.map(node => {
  //     return {
  //       ...node,
  //     }
  //   })
  // } else if (direction === LayoutDirection.Horizontal) {
  //   nodes.value = nodes.value.map(node => {
  //     return {
  //       ...node,
  //     }
  //   })
  // }

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
   * 向连接点添加一个辩护
   */
  const newWarrantNode = {
    id: 'warrant' + nodes.value.length,
    type: 'warrant',
    position: { x: 0, y: 0 },
    data: {
      nodeId: 'warrant' + nodes.value.length,
      modelValue:'',
    },
  }

  const newEdge = {
    id: 'warrant-connect' + nodes.value.length,
    _type: 'warrant',
    source: 'warrant' + nodes.value.length,
    target: hasQualifier.value ? qualifierId.value : 'claim',
  }

  nodes.value = [...nodes.value, newWarrantNode]
  edges.value = [...edges.value, newEdge]

  layoutGraph(LayoutDirection.Vertical).then(() => {
    handleLayoutGraph()
  })
  // await handleLayoutGraph()
}

const handleAddBacking = (payload: AddBackPayload) => {
  const { nodeId } = payload
  const newBackingNode = {
    id: 'backing' + nodes.value.length,
    type: 'backing',
    position: { x: 0, y: 0 },
    data: {
      modelValue:''
    }
  }
  const newEdge = {
    id: 'backing-connect' + nodes.value.length,
    source: 'backing' + nodes.value.length,
    target: nodeId,
    _type: 'backing',
  }

  nodes.value = [...nodes.value, newBackingNode]
  edges.value = [...edges.value, newEdge]

  layoutGraph(LayoutDirection.Vertical).then(() => {
    handleLayoutGraph()
  })
}

const hasQualifier = ref(false)

const qualifierId = ref('')

const qualifierEdgeId = ref('')

const handleAddQualifier = () => {
  /**
   * 添加限定词
   */
  if (!hasQualifier.value) {
    hasQualifier.value = true
  } else {
    ElMessage({
      type: 'warning',
      message: '只能添加一次限定词',
      duration: 1000,
    })
    return
  }
  qualifierId.value = 'qualifier' + nodes.value.length
  const newQualifierNode = {
    id: qualifierId.value,
    type: 'qualifier',
    position: { x: 0, y: 0 },
    data: {
      modelValue: ''
    }
  }
  qualifierEdgeId.value = 'qualifier-connect' + nodes.value.length
  // 限定词指向Calaim结论
  const newEdge = {
    id: qualifierEdgeId.value,
    source: qualifierId.value,
    target: 'claim',
    _type: 'qualifier',
  }

  // 遍历edges，如果有辩护就将辩护指向限定词
  edges.value = edges.value.map(edge => {
    if (edge?._type === 'warrant' || edge?._type === 'data') {
      return {
        ...edge,
        target: qualifierId.value,
      }
    }
    return edge
  })

  nodes.value = [...nodes.value, newQualifierNode]

  edges.value = [...edges.value, newEdge]

  layoutGraph(LayoutDirection.Vertical).then(() => {
    handleLayoutGraph()
  })
}

const hasRebuttal = ref(false)

const handleAddRebuttal = () => {
  /**
   * 添加反驳
   */
  // 必须要先添加限定词才可以添加反驳
  if (!hasQualifier.value) {
    ElMessage({
      type: 'warning',
      message: '请先添加限定词',
      duration: 1000,
    })
    return
  }
  if (!hasRebuttal.value) {
    hasRebuttal.value = true
  } else {
    ElMessage({
      type: 'warning',
      message: '只能添加一次反驳',
      duration: 1000,
    })
    return
  }

  const newRebuttalNode = {
    id: 'rebuttal' + nodes.value.length,
    type: 'rebuttal',
    position: { x: 0, y: 0 },
    data: {
      modelValue: ''
    }
  }

  // 将限定词的id指向反驳
  for (let i = 0; i < edges.value.length; i++) {
    if (edges.value[i]._type === 'qualifier') {
      edges.value[i].target = 'rebuttal' + nodes.value.length
      break
    }
  }

  const newEdge = {
    id: 'rebuttal-connect' + nodes.value.length,
    source: 'rebuttal' + nodes.value.length,
    target: 'claim',
    _type: 'rebuttal',
  }

  nodes.value = [...nodes.value, newRebuttalNode]
  edges.value = [...edges.value, newEdge]

  layoutGraph(LayoutDirection.Vertical).then(() => {
    handleLayoutGraph()
  })
}

const argumentVueFlowRef = ref<InstanceType<typeof VueFlow> | null>()

const getAllNodes = () => {
  nodes.value.forEach(node => {
    const n = findNode(node.id)
    console.log(n)
  })
}

const getArgumentNodes = () => {
  getAllNodes()
  return nodes.value
}

const getArgumentEdges = () => {
  return edges.value
}

defineExpose({
  getArgumentNodes,
  getArgumentEdges,
})
</script>

<template>
  <VueFlow :nodes="nodes" :edges="edges" ref="argumentVueFlowRef">
    <template #node-data="props">
      <data-component v-model="props.data.inputValue"></data-component>
    </template>

    <template #node-conncetion="props">
      <conncetionComponent
        v-model="props.data.inputValue"
      ></conncetionComponent>
    </template>

    <template #node-warrant="props">
      <WarrantComponent
        :nodeId="props.data.nodeId"
        v-model="props.data.inputValue"
        @addBacking="handleAddBacking"
      ></WarrantComponent>
    </template>

    <template #node-backing="props">
      <BackingComponent v-model="props.data.inputValue"></BackingComponent>
    </template>

    <template #node-claim="props">
      <ClaimComponent v-model="props.data.inputValue"></ClaimComponent>
    </template>

    <template #node-qualifier="props">
      <QualifierComponent v-model="props.data.inputValue"></QualifierComponent>
    </template>

    <template #node-rebuttal="props">
      <RebuttalComponent v-model="props.data.inputValue"></RebuttalComponent>
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
        >加入辩护</el-button
      >

      <el-button
        plain
        style="margin-left: 0"
        color="#4535C1"
        @click="handleAddQualifier"
        >加限定词</el-button
      >

      <el-button
        plain
        style="margin-left: 0"
        color="#DC0083"
        @click="handleAddRebuttal"
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
