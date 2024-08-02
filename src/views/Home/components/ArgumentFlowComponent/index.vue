<script setup lang="ts">
import { h, ref } from 'vue'
import { VueFlow, Panel, useVueFlow } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import { useLayout } from '@/hooks/VueFlow/useLayout'
import type { NodeType, EdgeType, AddBackPayload, FeedBack } from './type.ts'
import { ArgumentType } from './type.ts'
import { LayoutDirection } from './type.ts'
import '@vue-flow/controls/dist/style.css'
import ElementComponent from '../ElementComponent/index.vue'
import { useDialog } from './hooks/dialog/index'
import Dialog from './components/dialog/index.vue'
import { useNodeEdgeHandler } from '@/utils/nodeEdgeHandler/index.ts'
/**
 * FIXME: 重构节点的添加和删除，这里太屎了，非常难写
 */

const {
  createNode,
  createEdge,
  getDataNodeId,
  getClaimNodeId,
  getNodeById,
  removeNodeById,
  removeEdgeByRelatedId,
  removeEdgeByTargetType,
  getNodeIdsByType,
  findIsEdgesExistBySourceId,
  clearNotRealatedEdges,
  findIsEdgeExistByFilterFunction,
} = useNodeEdgeHandler()

enum Status {
  Propose,
  Approve,
  Reject,
}

const props = withDefaults(
  defineProps<{
    status?: Status
  }>(),
  {
    status: Status.Propose,
  }
)

const initData = {
  nodes: [
    {
      id: 'data', // 初始化时前提和结论的id是定死的
      type: 'element',
      position: { x: 0, y: 0 },
      _type: ArgumentType.Data,
      data: {
        inputValue: '',
        _type: ArgumentType.Data,
      },
    },
    {
      id: 'claim',
      type: 'element',
      position: { x: 0, y: 0 },
      _type: ArgumentType.Claim,
      data: {
        inputValue: '',
        _type: ArgumentType.Claim,
      },
    },
  ],
  edges: [
    {
      id: 'init-data-claim',
      source: 'data',
      target: 'claim',
      _type: `${ArgumentType.Data}_${ArgumentType.Claim}`,
    },
  ],
}

const nodes = ref<NodeType[]>([])

const edges = ref<EdgeType[]>([])

const setNodeEdgeValue = () => {
  if (props.status === Status.Propose) {
    nodes.value = initData.nodes
    edges.value = initData.edges
  }
}

setNodeEdgeValue()

const reset = () => {
  if (props.status !== Status.Propose) {
    ElNotification({
      title: '警告',
      message: '你不能重置已经完成的论证!',
      type: 'warning',
    })
    return
  }
  // console.log('重置')

  nodes.value = initData.nodes
  edges.value = initData.edges
  handleLayoutGraph()
}

const dataClaimIds = ref({
  dataId: getDataNodeId(nodes.value),
  claimId: getClaimNodeId(nodes.value),
})

// 将来做成异步的请求Nodes和Edges

const { layout } = useLayout()

const { fitView } = useVueFlow()

async function layoutGraph(direction: LayoutDirection) {
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

// ==================================
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
    const _type = item.data._type

    switch (_type) {
      case ArgumentType.Warrant:
        flagMap.warrant = true
        warrantsList.push(item)
        break
      case ArgumentType.Qualifier:
        flagMap.qualifier = true
        break
      case ArgumentType.Rebuttal:
        flagMap.rebuttal = true
        break
      default:
        break
    }
  })

  // 查找有没有支撑
  let hasBacking = false

  for (let j = 0; j < warrantsList.length; j++) {
    const item = warrantsList[j]
    hasBacking = findIsEdgeExistByFilterFunction(edges.value, edge => {
      return (
        edge._type === `${ArgumentType.Backing}_${ArgumentType.Warrant}` &&
        edge.target === item.id
      )
    })
    // 没有支撑
    if (!hasBacking) break
  }

  // const noBackingWarrants: NodeType[] = []

  // /**
  //  * 查找哪一个辩护没有支撑
  //  */
  // edges?.value?.forEach(item => {
  //   console.log('debugger item ===>', item)
  //   if (item._type === `${ArgumentType.Backing}_${ArgumentType.Warrant}`) {

  //     const targetWarrant = item.target

  //     let i: number
  //     for (i = 0; i < warrantsList.length; i++) {
  //       if (targetWarrant === warrantsList[i].id) {
  //         break
  //       }
  //     }

  //     if (i === warrantsList.length) {
  //       noBackingWarrants.push(warrantsList[i])
  //     }
  //   }
  // })

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

  // 没有辩护时不会出现提示需要支撑
  if (warrantsList.length && !hasBacking) {
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

// =========================================

// ========================================
/**
 * 辩护
 */
const handleAddWarrant = () => {
  /**
   * 向连接点添加一个辩护
   */
  const { id, newNode } = createNode(ArgumentType.Warrant)

  const params = {
    source: id,
    target:
      (hasQualifier.value ? qualifierId.value : dataClaimIds.value.claimId) ||
      '',
    sourceType: ArgumentType.Warrant,
    targetType: hasQualifier.value
      ? ArgumentType.Qualifier
      : ArgumentType.Claim,
  }

  const { newEdge } = createEdge(params)

  nodes.value = [...nodes.value, newNode]
  edges.value = [...edges.value, newEdge]

  layoutGraph(LayoutDirection.Vertical).then(() => {
    handleLayoutGraph()
  })

  feedbackCallback()
}

const handleRemoveWarrant = (id: string): boolean => {
  // 移除辩护
  // 如果有支撑则不能移除
  const flag = findIsEdgesExistBySourceId(edges.value, id, (item: EdgeType) => {
    return item._type === `${ArgumentType.Backing}_${ArgumentType.Warrant}`
  })
  if (flag) {
    ElNotification({
      title: '提示',
      message: '不能移除带有支撑的辩护!',
      type: 'warning',
    })
    return false
  }

  const cb = () => {
    removeNodeById(nodes.value, id)
    edges.value = removeEdgeByRelatedId(edges.value, id)
  }

  callBacks.value.push(cb)

  return true
}

// ========================================

/**
 *
 * @param payload {nodeId: string}
 * 为辩护添加支撑
 */
const handleAddBacking = (payload: AddBackPayload) => {
  const { nodeId } = payload

  const { id, newNode } = createNode(ArgumentType.Backing)

  const params = {
    source: id,
    target: nodeId,
    sourceType: ArgumentType.Backing,
    targetType: ArgumentType.Warrant,
  }

  const { newEdge } = createEdge(params)

  nodes.value = [...nodes.value, newNode]
  edges.value = [...edges.value, newEdge]

  layoutGraph(LayoutDirection.Vertical).then(() => {
    handleLayoutGraph()
  })

  feedbackCallback()
}

const handleRemoveBacking = (id: string): boolean => {
  // 移除支撑
  const cb = () => {
    console.log('删除支撑')
    removeNodeById(nodes.value, id)
  }

  callBacks.value.push(cb)

  return true
}

// ========================
/**
 * 下面的逻辑是添加限定词
 */
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

  const { id, newNode } = createNode(ArgumentType.Qualifier)

  qualifierId.value = id

  const params = {
    source: qualifierId.value,
    target: dataClaimIds.value.claimId || '',
    sourceType: ArgumentType.Qualifier,
    targetType: ArgumentType.Claim,
  }

  const { id: edgeId, newEdge } = createEdge(params)

  qualifierEdgeId.value = edgeId

  //原先的data和warrant node都指向了结论，添加限定词后要将它们指向限定词
  const dataToClaim = `${ArgumentType.Data}_${ArgumentType.Claim}`
  const warrantToClaim = `${ArgumentType.Warrant}_${ArgumentType.Claim}`

  edges.value = edges.value.map(edge => {
    if (edge._type === dataToClaim || edge._type === warrantToClaim) {
      return {
        ...edge,
        _type: edge._type === dataToClaim ? dataToClaim : warrantToClaim,
        target: qualifierId.value,
      }
    }
    return edge
  })

  nodes.value = [...nodes.value, newNode]

  edges.value = [...edges.value, newEdge]

  layoutGraph(LayoutDirection.Vertical).then(() => {
    handleLayoutGraph()
  })

  feedbackCallback()
}

const handleRemoveQualifier = (): boolean => {
  // 不允许删除具有反驳的限定词节点
  if (hasRebuttal.value) {
    ElMessage({
      type: 'warning',
      message: '不允许删除具有反驳的限定词节点',
      duration: 1000,
    })
    return false
  }

  hasQualifier.value = false

  const cb = () => {
    removeNodeById(nodes.value, qualifierId.value)
    // 移除任何指向限定词的edge
    edges.value = removeEdgeByTargetType(edges.value, ArgumentType.Qualifier)
    // 更改指向, 将类型为Data、Warrant的节点指向结论
    const idAndTypes = getNodeIdsByType(nodes.value, [
      ArgumentType.Data,
      ArgumentType.Warrant,
    ])

    // 构造新的边
    const newEdges: EdgeType[] = []

    idAndTypes.forEach(item => {
      if (!item) return
      const params = {
        source: item.id,
        target: dataClaimIds.value.claimId || '',
        sourceType: item._type,
        targetType: ArgumentType.Claim,
      }

      const { newEdge } = createEdge(params)

      newEdges.push(newEdge)
    })

    edges.value = [...edges.value, ...newEdges]
  }

  callBacks.value.push(cb)

  return true
}

// ===========================
/**
 * 下面的逻辑是添加反驳
 */
const hasRebuttal = ref(false)

const handleAddRebuttal = () => {
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

  const { id, newNode } = createNode(ArgumentType.Rebuttal)

  // 将限定词节点指向反驳节点
  // 原先限定词是指向Claim节点的
  for (let i = 0; i < edges.value.length; i++) {
    if (
      edges.value[i]._type === `${ArgumentType.Qualifier}_${ArgumentType.Claim}`
    ) {
      edges.value[i].target = id
      break
    }
  }

  // 添加一条反驳指向claim的边
  const params = {
    source: id,
    target: dataClaimIds.value.claimId || '',
    sourceType: ArgumentType.Rebuttal,
    targetType: ArgumentType.Claim,
  }

  const { newEdge } = createEdge(params)

  nodes.value = [...nodes.value, newNode]
  edges.value = [...edges.value, newEdge]

  layoutGraph(LayoutDirection.Vertical).then(() => {
    handleLayoutGraph()
  })

  feedbackCallback()
}

const handleRemoveRebuttal = (id: string): boolean => {
  const cb = () => {
    hasRebuttal.value = false

    // 1. 删除node节点
    removeNodeById(nodes.value, id)
    // 2. 要将和反驳相关的edge全部删除
    edges.value = removeEdgeByRelatedId(edges.value, id)

    // 3. 将限定词节点指向结论
    const params = {
      source: qualifierId.value,
      target: dataClaimIds.value.claimId || '',
      sourceType: ArgumentType.Qualifier,
      targetType: ArgumentType.Claim,
    }

    const { newEdge } = createEdge(params)

    edges.value = [...edges.value, newEdge]
  }

  callBacks.value.push(cb)

  return true
}

// ===========================

// ===========================
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

const callBacks = ref<Function[]>([])

const handleDeleteNode = (id: string): boolean => {
  // 不允许删除前提 和 结论节点
  // 1. 查找id对应的节点
  const node = getNodeById(nodes.value, id)
  if (!node) return false

  const _type = node._type

  let flag = true

  switch (_type) {
    case ArgumentType.Claim:
    case ArgumentType.Data:
      ElNotification({
        title: 'Error',
        message: '不允许删除前提和结论节点',
        type: 'error',
        position: 'bottom-right',
      })
      flag = false
      break
    case ArgumentType.Qualifier:
      flag = handleRemoveQualifier()
      break
    case ArgumentType.Rebuttal:
      flag = handleRemoveRebuttal(id)
      break
    case ArgumentType.Warrant:
      flag = handleRemoveWarrant(id)
      break
    case ArgumentType.Backing:
      flag = handleRemoveBacking(id)
      break
    default:
      console.log('Something went wrong, the _type = ', _type)
      break
  }

  return flag
}

onNodesChange(async changes => {
  const nextChanges = []

  for (const change of changes) {
    if (change.type === 'remove') {
      callBacks.value = []

      if (!handleDeleteNode(change.id)) {
        return
      }

      const isConfirmed = await dialog.confirm(dialogMsg(change.id))

      if (isConfirmed) {
        for (const cb of callBacks.value) {
          cb()
        }
        // 移除所有不相干的边
        edges.value = clearNotRealatedEdges(nodes.value, edges.value)
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
    if (change.type !== 'remove') {
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
      <el-popconfirm title="你确定要重置论证?" @confirm="reset">
        <template #reference>
          <el-button plain style="margin-left: 0" color="#03346E">
            重置论证
          </el-button>
        </template>
      </el-popconfirm>

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
        :closable="false"
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
