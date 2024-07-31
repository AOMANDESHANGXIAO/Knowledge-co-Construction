<script setup lang="ts">
import { h, ref } from 'vue'
import { VueFlow, Panel, useVueFlow } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import { useLayout } from '@/hooks/VueFlow/useLayout'
import type { NodeType, EdgeType, AddBackPayload, FeedBack } from './type.ts'
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

/**
 * 定义反馈逻辑
 */
const feedbackList = ref<FeedBack[]>([])

interface FBOpt {
  [key: string]: {
    title: string
    description: string
    type: 'success' | 'warning' | 'error' | 'info'
  }
}

const feedbackOptions: FBOpt = {
  warrant: {
    title: '缺少辩护',
    description: '需要一个辩护来解释前提和结论的关系',
    type: 'warning',
  },
  qualifier: {
    title: '缺少限定词',
    description: '需要一个限定词来限制当前论点的范围',
    type: 'warning',
  },
  rebuttal: {
    title: '缺少反驳',
    description: '需要一个反驳来委婉化当前论点',
    type: 'warning',
  },
  backing: {
    title: '缺少支撑',
    description: '有一个辩护没有支撑!',
    type: 'warning',
  },
  perfect: {
    title: '论点完美',
    description: '这是一个结构完整的论证!',
    type: 'success',
  },
}

const feedbackCallback = () => {
  const flagMap = {
    warrant: false, // 辩护
    rebuttal: false, // 反驳
    qualifier: false, // 限定词
  }

  const warrantsList: NodeType[] = []

  nodes?.value?.forEach(item => {
    if (item.data._type === ElementType.Warrant) {
      flagMap.warrant = true
      warrantsList.push(item)
    } else if (item.data._type === ElementType.Qualifier) {
      flagMap.qualifier = true
    } else if (item.data._type === ElementType.Rebuttal) {
      flagMap.rebuttal = true
    }
  })

  const noBackingWarrants: NodeType[] = []

  edges?.value?.forEach(item => {
    if (item._type === 'backing') {
      const targetWarrant = item.target
      // 遍历warrantsList, 查找哪一个辩护没有支撑
      // warrantsList.forEach(warrant => {
      //   if (targetWarrant === warrant.id) {

      //   }
      // })
      let i: number
      for (i = 0; i < warrantsList.length; i++) {
        if (targetWarrant === warrantsList[i].id) {
          break
        }
      }

      if (i === warrantsList.length) {
        noBackingWarrants.push(warrantsList[i])
      }
    }
  })

  // 根据flagMap，判断是否生成反馈
  let feedbacks = []
  Object.keys(flagMap).forEach(key => {
    if (!flagMap[key as keyof typeof flagMap]) {
      feedbacks.push({
        title: feedbackOptions[key as keyof typeof flagMap].title,
        description: feedbackOptions[key as keyof typeof flagMap].description,
        type: feedbackOptions[key as keyof typeof flagMap].type,
      })
    }
  })
  if (noBackingWarrants.length > 0) {
    feedbacks.push({
      title: feedbackOptions.backing.title,
      description: feedbackOptions.backing.description,
      type: feedbackOptions.backing.type,
    })
  }

  if (feedbacks.length === 0) {
    feedbacks.push({
      title: feedbackOptions.perfect.title,
      description: feedbackOptions.perfect.description,
      type: feedbackOptions.perfect.type,
    })
  }

  feedbackList.value = [...feedbacks]
}

feedbackCallback()

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

  feedbackCallback()
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

  feedbackCallback()
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

  feedbackCallback()
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

  feedbackCallback()
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

// =========================

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

    <Panel position="top-left" class="feedback-tips">
      <el-alert
        v-for="(item, index) in feedbackList"
        :key="index"
        :title="item.title"
        :type="item.type"
        :description="item.description"
        show-icon
      ></el-alert>
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
.feedback-tips {
  display: flex;
  flex-direction: column;
  gap: 10px;
  box-shadow: 0 0 2px 1px rgba(0, 0, 0, 0.08);
  padding: 10px;
  width: 200px;
  /* min-height: 200px; */
  background-color: #fff;
}
</style>
