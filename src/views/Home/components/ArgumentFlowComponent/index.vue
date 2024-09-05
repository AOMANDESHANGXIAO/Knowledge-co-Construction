<script setup lang="ts">
import { h, ref } from 'vue'
import { VueFlow, Panel, useVueFlow } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import { useLayout } from '@/hooks/VueFlow/useLayout'
import type { NodeType, EdgeType, AddBackPayload } from './type.ts'
import { Status } from './type'
import { ArgumentType } from './type.ts'
import { LayoutDirection } from './type.ts'
import '@vue-flow/controls/dist/style.css'
import ElementComponent from '../ElementComponent/index.vue'
import { useDialog } from './hooks/dialog/index'
import Dialog from './components/dialog/index.vue'
import { useNodeEdgeHandler } from '@/utils/nodeEdgeHandler/index.ts'
import list from './data.ts'
import useState from '@/hooks/State/useState.ts'
import useRequest from '@/hooks/Async/useRequest'
import { queryNodeContentApi } from '@/apis/flow'
import { QueryNodeContentData } from '@/apis/flow/type'
import { convertToHTML } from './utils'
import { onMounted } from 'vue'
import useFeedback from './hooks/useFeedback'
import ArrowIcon from './components/icon/index.vue'
// import useQueryParam from '@/hooks/router/useQueryParam'

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
} = useNodeEdgeHandler()

const props = withDefaults(
  defineProps<{
    status?: Status
    nodes?: NodeType[]
    edges?: EdgeType[]
    nodeId?: string // nodeId是为了查询观点内容
    reply?: 'none' | 'reject' | 'approve' // 表示是否正在修改
    topicContent?: string
  }>(),
  {
    status: Status.Propose,
    nodes: () => [],
    edges: () => [],
    nodeId: '',
    reply: 'none',
    topicContent: '',
  }
)

const initData = list

const [nodes, setNodesValue] = useState<NodeType[]>([])

const [edges, setEdgesValue] = useState<EdgeType[]>([])

const initState = () => {
  setNodesValue(initData.nodes)
  setEdgesValue(initData.edges)
  setFitView()
}

const { run: queryNodeContent } = useRequest({
  apiFn: async () => {
    const id = props.nodeId as string
    return await queryNodeContentApi(+id)
  },
  onSuccess: ({
    nodes,
    edges,
  }: {
    nodes: any
    edges: QueryNodeContentData['edges']
  }) => {
    // console.log('queryNodeContent', nodes, edges)
    setNodesValue(nodes)
    setEdgesValue(edges)
  },
  formatter: (data: QueryNodeContentData) => {
    return {
      nodes: data.nodes.map(node => ({
        ...node,
        _type: node.data._type,
      })),
      edges: data.edges,
    }
  },
  onError: () => {},
  onFinally: () => {
    setFitView()
  },
})

const reset = () => {
  if (props.status === Status.Check) {
    ElNotification({
      title: '警告',
      message: '该论点仅供查看!',
      type: 'warning',
    })
    return
  } else if (props.status === Status.Propose) {
    initState()
    feedbackCallback()
    handleLayoutGraph()
  }
}

const dataClaimIds = ref({
  dataId: getDataNodeId(nodes.value),
  claimId: getClaimNodeId(nodes.value),
})

const { layout } = useLayout()

const { fitView } = useVueFlow()

async function layoutGraph(direction: LayoutDirection) {
  setNodesValue(layout(nodes.value, edges.value, direction))

  await nextTick(() => {
    fitView()
  })
}

const { onPaneReady } = useVueFlow()

onPaneReady(() => {
  handleLayoutGraph()
})

const handleLayoutGraph = async () => {
  setNodesValue(layout(nodes.value, edges.value, 'TB'))

  await nextTick(() => {
    fitView()
  })
}

const setFitView = () => {
  setTimeout(() => {
    handleLayoutGraph()
  }, 100)
}

/**
 * 在外面强制更新组件,不然处理起来太麻烦了
 */
onMounted(async () => {
  if (props.status === Status.Check) {
    // 发送请求，获取数据
    queryNodeContent()
  } else if (props.status === Status.Propose) {
    // 将nodes,和edges设置为初始
    initState()
  }
})

// ==================================
/**
 * 定义反馈逻辑
 */
const { feedbackList, feedbackCallback: feedbackFunction } = useFeedback()

const feedbackCallback = () => {
  const nodesValue = nodes.value
  const edgesValue = edges.value

  feedbackFunction(nodesValue, edgesValue)
}

onMounted(() => {
  feedbackCallback()
})

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

  setNodesValue([...nodes.value, newNode])
  setEdgesValue([...edges.value, newEdge])

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

  setNodesValue([...nodes.value, newNode])
  setEdgesValue([...edges.value, newEdge])

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

  setNodesValue([...nodes.value, newNode])

  setEdgesValue([...edges.value, newEdge])

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

    setEdgesValue([...edges.value, ...newEdges])
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

  setNodesValue([...nodes.value, newNode])
  setEdgesValue([...edges.value, newEdge])

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

    setEdgesValue([...edges.value, newEdge])
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
    // 不允许在查看时删除
    if (change.type === 'remove' && props.status !== Status.Check) {
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
        setEdgesValue(clearNotRealatedEdges(nodes.value, edges.value))
        nextChanges.push(change)
        handleLayoutGraph()
      }
    } else {
      nextChanges.push(change)
    }
  }
  if (props.status === Status.Check) return
  applyNodeChanges(nextChanges)
})

onEdgesChange(async changes => {
  const nextChanges = changes.filter(change => change.type !== 'remove')

  applyEdgeChanges(nextChanges)
})
// ===========================

const editVisible = computed(() => {
  return props.status !== Status.Check
})

// ==========================

// =========================
const argumentVueFlowRef = ref<InstanceType<typeof VueFlow> | null>()

/**
 * 这个函数被用来初始化发布观点
 */
// const handleInitProposeArgument = () => {
//   initState() // 首先重置节点内容
//   setFitView() // 设置视图
// }

const getArgumentNodes = () => {
  return nodes.value
}

const getArgumentEdges = () => {
  return edges.value
}

const setNodes = (value: NodeType[]) => {
  setNodesValue(value)
}

const setEdges = (value: EdgeType[]) => {
  setEdgesValue(value)
}

defineExpose({
  getArgumentNodes,
  getArgumentEdges,
  setNodes,
  setEdges,
  setFitView,
  handleLayoutGraph,
  initState,
  // handleInitProposeArgument,
})

// TODO: 1. 设置两个按钮，在查看观点时，可以选择支持观点或者反对观点。
// 记录点击支持或者反对后指向的观点
const [targetNodes, setTargetNodes] = useState<NodeType[]>([])

const [targetEdges, setTargetEdges] = useState<EdgeType[]>([])

const setTargetArgument = (nodes: NodeType[], edges: EdgeType[]) => {
  setTargetNodes([...nodes])
  setTargetEdges([...edges])
}

const emits = defineEmits<{
  (e: 'update:reply', reply: 'none' | 'reject' | 'approve'): void
  (e: 'update:status', status: Status): void
}>()

const handleClickSupport = () => {
  setTargetArgument(nodes.value, edges.value)
  emits('update:reply', 'approve') // 传递给父组件
  emits('update:status', Status.Propose)
}

const handleClickOppose = () => {
  setTargetArgument(nodes.value, edges.value)
  emits('update:reply', 'reject') // 传递给父组件
  emits('update:status', Status.Propose)
}

const MAX_CONTENT_WIDTH = '400px'
const MIN_CONTENT_WIDTH = '20px'

const contentStyle = ref({
  width: MAX_CONTENT_WIDTH,
  transition: 'width 0.3s',
})

const handleClickArrow = () => {
  // 折叠
  // console.log('折叠')
  if (contentStyle.value.width === MIN_CONTENT_WIDTH) {
    contentStyle.value.width = MAX_CONTENT_WIDTH
    // console.log(contentStyle.value.width)
  } else {
    contentStyle.value.width = MIN_CONTENT_WIDTH
    // console.log(contentStyle.value.width)
  }
}

const title = computed(() => {
  if (props.reply === 'none') {
    return '发表观点'
  } else if (props.reply === 'approve') {
    return '支持观点'
  } else if (props.reply === 'reject') {
    return '反对观点'
  } else {
    return ''
  }
})

const content = computed(() => {
  if (props.reply === 'none') {
    return props.topicContent
  } else if (props.reply === 'approve' || props.reply === 'reject') {
    return convertToHTML({ nodes: targetNodes.value, edges: targetEdges.value })
  } else {
    return ''
  }
})

// // TODO: 2. 在右下角显示正在回应的组件的文字版本
// const argumentText = computed(() => {
//   return convertToHTML({ nodes: targetNodes.value, edges: targetEdges.value })
// })
//
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
        :visible="editVisible"
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

    <Panel
      position="top-right"
      class="button-group-container"
      v-if="props.status === Status.Propose"
    >
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

    <!-- 在查看观点时可以选择支持观点或者反对观点 -->
    <Panel
      position="top-right"
      class="button-group-container"
      v-else-if="props.status === Status.Check"
    >
      <el-popconfirm
        title="你确定要跳转至观点编辑页面吗?"
        @confirm="handleClickSupport"
      >
        <template #reference>
          <el-button plain style="margin-left: 0" type="success"
            >支持观点</el-button
          >
        </template>
      </el-popconfirm>
      <el-popconfirm
        title="你确定要跳转至观点编辑页面吗?"
        @confirm="handleClickOppose"
      >
        <template #reference>
          <el-button plain style="margin-left: 0" type="danger"
            >反对观点</el-button
          >
        </template>
      </el-popconfirm>
    </Panel>

    <Panel
      position="top-left"
      class="feedback-tips"
      v-if="props.status !== Status.Check"
    >
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

    <!-- TODO: 右下角的文字版，表示正在反驳或是关注的观点 -->
    <!-- 在提出观点时，显示当前话题的文本 -->
    <Panel position="bottom-right" class="argument-text" :style="contentStyle">
      <!-- 可以折叠 -->
      <section style="width: 100%; height: 100%; position: relative">
        <ArrowIcon
          class="arrow"
          @click="handleClickArrow"
          :class="
            contentStyle.width === MAX_CONTENT_WIDTH ? 'arrow-up' : 'arrow-down'
          "
        ></ArrowIcon>
        <el-scrollbar height="200px">
          <h3 class="argument-text-title" :class="props.reply">
            {{ title }}
          </h3>
          <div class="argument-text-content" v-html="content"></div>
        </el-scrollbar>
      </section>
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
.argument-text {
  box-shadow: 0 0 2px 1px rgba(0, 0, 0, 0.08);
  padding: 10px;
  background-color: #fff;
  width: 400px;
  height: 200px;
  /* overflow: auto; */
}
.argument-text-content {
  /* overflow-y: auto; */
  font-size: 14px;
  line-height: 1.5;
  font-family: 'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif;
}

.argument-text-title {
  margin-bottom: 10px;
}
.approve {
  color: green;
}
.oppose {
  color: red;
}

.arrow {
  position: absolute;
  right: 10px;
  top: 10px;
  cursor: pointer;
  z-index: 20;
  transition: all 0.3s ease;
}

.arrow-up {
  transform: rotate(0deg);
}
.arrow-down {
  transform: rotate(90deg);
  right: -7px;
  top: 0;
}
</style>
