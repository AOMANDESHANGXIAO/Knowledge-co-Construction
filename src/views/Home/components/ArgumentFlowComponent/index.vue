<script setup lang="ts">
import { h, ref } from 'vue'
import { VueFlow, Panel, useVueFlow } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import { useLayout } from '@/hooks/VueFlow/useLayout'
import type { NodeType, EdgeType, AddBackPayload } from './type.ts'
import { LayoutDirection } from './type.ts'
import '@vue-flow/controls/dist/style.css'
import { ElementType } from '../ElementComponent/type'
import ElementComponent from '../ElementComponent/index.vue'
import { useDialog } from './hooks/dialog/index'
import Dialog from './components/dialog/index.vue'

enum Status {
  Propose,
  Approve,
  Reject,
}

const props = withDefaults(
  defineProps<{
    status: Status
  }>(),
  {
    status: Status.Propose,
  }
)

const initData = {
  nodes: [
    {
      id: 'data',
      type: 'element',
      position: { x: 0, y: 0 },
      data: {
        inputValue: '',
        _type: ElementType.Data,
      },
    },
    {
      id: 'claim',
      type: 'element',
      position: { x: 0, y: 0 },
      data: {
        inputValue: '',
        _type: ElementType.Claim,
      },
    },
  ],
  edges: [
    {
      id: 'init-data-claim',
      source: 'data',
      target: 'claim',
      _type: 'data',
    },
  ],
}

const nodes = ref<NodeType[]>()

const edges = ref<EdgeType[]>()

if (props.status === Status.Propose) {
  nodes.value = initData.nodes
  edges.value = initData.edges
}

// 将来做成异步的请求Nodes和Edges

const { layout } = useLayout()

const { fitView } = useVueFlow()

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
    type: 'element',
    position: { x: 0, y: 0 },
    data: {
      nodeId: 'warrant' + nodes.value.length,
      inputValue: '',
      _type: ElementType.Warrant,
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
    type: 'element',
    position: { x: 0, y: 0 },
    data: {
      inputValue: '',
      _type: ElementType.Backing,
    },
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
    type: 'element',
    position: { x: 0, y: 0 },
    data: {
      inputValue: '',
      _type: ElementType.Qualifier,
    },
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
    type: 'element',
    position: { x: 0, y: 0 },
    data: {
      inputValue: '',
      _type: ElementType.Rebuttal,
    },
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

/**
 * 删除节点逻辑
 */
const {
  onConnect,
  addEdges,
  onNodesChange,
  onEdgesChange,
  applyNodeChanges,
  applyEdgeChanges,
} = useVueFlow()

const dialog = useDialog()

function dialogMsg(id: string) {
  return h(
    'span',
    {
      style: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px',
      },
    },
    [`你确定要删除此节点?`, h('br'), h('span', `[ELEMENT_ID: ${id}]`)]
  )
}

onConnect(addEdges)

onNodesChange(async changes => {
  const nextChanges = []

  for (const change of changes) {
    if (change.type === 'remove') {
      const isConfirmed = await dialog.confirm(dialogMsg(change.id))

      if (isConfirmed) {
        nextChanges.push(change)
      }
    } else {
      nextChanges.push(change)
    }
  }

  applyNodeChanges(nextChanges)
})

onEdgesChange(async changes => {
  const nextChanges = []

  for (const change of changes) {
    if (change.type === 'remove') {
      ElNotification({
        title: 'Error',
        message: '不允许删除边',
        type: 'error',
        position: 'bottom-right',
      })
      // const isConfirmed = await dialog.confirm(dialogMsg(change.id))

      // if (isConfirmed) {
      //   nextChanges.push(change)
      // }
    } else {
      nextChanges.push(change)
    }
  }

  applyEdgeChanges(nextChanges)
})

const argumentVueFlowRef = ref<InstanceType<typeof VueFlow> | null>()

const getArgumentNodes = () => {
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
  <VueFlow
    :nodes="nodes"
    :edges="edges"
    ref="argumentVueFlowRef"
    :apply-default="false"
  >
    <template #node-element="props">
      <ElementComponent
        :nodeId="props.data.nodeId"
        :_type="props.data._type"
        :tags="props.data.tags || []"
        v-model="props.data.inputValue"
        @addBacking="handleAddBacking"
      ></ElementComponent>
    </template>

    <Background
      :variant="'lines'"
      :size="200"
      patternColor="#1a192b"
      :gap="180"
    />

    <Dialog />

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

    <Panel position="top-left" class="feedback-tips"></Panel>
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
.feedback-tips {
  box-shadow: 0 0 2px 1px rgba(0, 0, 0, 0.08);
  padding: 10px;
  width: 200px;
  height: 200px;
}
</style>
