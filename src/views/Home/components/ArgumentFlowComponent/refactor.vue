<script setup lang="ts">
import { VueFlow, Panel, useVueFlow } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import '@vue-flow/controls/dist/style.css'
import { useLayout } from '@/hooks/VueFlow/useLayout'
import type { NodeType, EdgeType } from './type.ts'
import { Role, Action, ArgumentType } from './type.ts'
import useFeedback from './hooks/useFeedback.ts'
import useState from '@/hooks/State/useState.ts'
import ElementComponent from '../ElementComponent/index.vue'
import useRequest from '@/hooks/Async/useRequest'
import {
  queryNodeContentApi,
  queryGroupNodeContentApi,
} from '@/apis/flow/index.ts'
import { QueryNodeContentData } from '@/apis/flow/type'
import DEFAULT_ARGUMENT_STATE from './data.ts'
import useTips from './hooks/useTips'
import ArrowIcon from './components/icon/index.vue'
import useStateEdit from './hooks/useStateEdit.ts'
import Dialog from './components/dialog/index.vue'
import { useDialog } from './hooks/dialog/index'
import { Condition } from './type.ts'
import { useUserStore } from '@/store/modules/user/index.ts'
// import PeerIdeaContainer from './components/peerIdeaContainer/index.vue'
// import { queryGroupOptionApi } from '@/apis/flow/index.ts'
// import { QueryGroupOptionResponse } from '@/apis/flow/type.ts'
// import useQueryParam from '@/hooks/router/useQueryParam.ts'
// 组件一共几个状态
// 1. chechIdea 查看观点，如果是自己的则显示修改按钮， 如果不是自己的则显示 支持 或者 反对 按钮
// 2. checkConclusion 查看小组结论，如果是自己组的则可以修改，如果不是自己组的则只能查看
// 3. modifyIdea // 修改自己的观点
// 4. modifyConclusion // 修改小组结论
// 5. replyIdea 回复观点
// 6. proposeIdea 提出观点
// 7. proposeConclusion 提出小组结论

const props = withDefaults(
  defineProps<{
    InSelfGroup: boolean // 标记是否是自己的组
    InSelfIdea: boolean // 标记是否是自己的观点
    role: Role // 标记当前组件的角色，Idea或者Conclusion
    action: Action // 标记组件的动作，是否修改(Modify)或者查看观点（Check）
    condition: Condition
    showFeedBack: boolean // 是否显示反馈
    focusNodeId: string // 观点节点id
    reply: 'none' | 'reject' | 'approve' // 标记当前节点的回复状态
    topicContent: string // 正在发表观点的内容
    modifiedNodes: NodeType[]
    modifiedEdges: EdgeType[]
    replyNodes: NodeType[]
    replyEdges: EdgeType[]
  }>(),
  {
    condition: 'checkIdea',
    InSelfGroup: false,
    InSelfIdea: false,
    role: Role.Idea,
    action: Action.Check,
    showFeedBack: true,
    focusNodeId: '',
    topicContent: '',
    modifiedNodes: () => [],
    modifiedEdges: () => [],
    replyNodes: () => [],
    replyEdges: () => [],
    reply: 'none',
  }
)
/**
 * 更新nodes和edges时，需要更新ChatGpt的nodes和edges
 */
const [nodes, setNodesValue] = useState<NodeType[]>([], {
  onUpdate: () => {
    emit('onUpdateArgumentFlowState')
  },
})
const [edges, setEdgesValue] = useState<EdgeType[]>([], {
  onUpdate: () => {
    emit('onUpdateArgumentFlowState')
  },
})

const setDefaultValue = () => {
  setNodesValue(DEFAULT_ARGUMENT_STATE.nodes)
  setEdgesValue(DEFAULT_ARGUMENT_STATE.edges)
  setFitView()
}

const { fitView, onPaneReady } = useVueFlow()

const { layout } = useLayout()

const setFitView = async () => {
  setTimeout(async () => {
    setNodesValue(layout(nodes.value, edges.value, 'TB'))
    setTimeout(() => {
      fitView()
    }, 50)
  }, 0)
}

onPaneReady(() => {
  setFitView()
})

const { feedbackList } = useFeedback({
  nodes,
  edges,
})

/**
 * queryArgumentState用于查询并且设置nodes和edges的状态
 * 如果没有查询出来，则设置默认状态
 */
const userStore = useUserStore()
const { getOneUserInfo } = userStore
const { run: queryArgumentState } = useRequest({
  apiFn: async () => {
    const student_id = getOneUserInfo('id') as string
    return await queryNodeContentApi(+props.focusNodeId, +student_id)
  },
  onSuccess(data: QueryNodeContentData) {
    const { nodes, edges } = data
    setNodesValue(nodes)
    setEdgesValue(edges)
    setFitView()
  },
  onFail() {
    setDefaultValue()
  },
  onError() {
    ElNotification({
      title: '提示',
      message: '该观点不存在',
      type: 'warning',
    })
  },
  onFinally() {},
  formatter(data: QueryNodeContentData) {
    return {
      nodes: data.nodes.map(node => ({
        ...node,
        _type: node.data._type,
      })),
      edges: data.edges,
    }
  },
})
const { run: getGroupNodeContent } = useRequest({
  apiFn: async () => {
    const student_id = getOneUserInfo('id') as string
    return queryGroupNodeContentApi(+props.focusNodeId, +student_id)
  },
  onSuccess(data: QueryNodeContentData) {
    const { nodes, edges } = data
    setNodesValue(nodes)
    setEdgesValue(edges)
    setFitView()
  },
  onFail() {
    setDefaultValue()
  },
  onError() {
    ElNotification({
      title: '提示',
      message: '该观点不存在',
      type: 'warning',
    })
  },
  onFinally() {},
  formatter(data: QueryNodeContentData) {
    return {
      nodes: data.nodes.map(node => ({
        ...node,
        _type: node.data._type,
      })),
      edges: data.edges,
    }
  },
})
/**
 * 检查观点时，会根据聚焦的Node的id去查询节点内容
 */
function whenCheckIdea() {
  console.log('whenCheckIdea')
  queryArgumentState()
}

/**
 * 检查观点时，也会根据聚焦的Node的id去查询节点内容
 */
function whenCheckConclusion() {
  console.log('whenCheckConclusion')
  // queryArgumentState()
  getGroupNodeContent()
}

/**
 * 修改观点时，如果有聚焦的Node的id，则会根据聚焦的Node的id去查询节点内容
 * 如果没有聚焦的Node的id，则设置默认状态
 */
function whenModifyIdea() {
  console.log('whenModifyIdea')
  queryArgumentState()
  setFitView()
}

/**
 * 修改观点时，也会根据聚焦的Node的id去查询节点内容
 * 如果没有聚焦的Node的id，则设置默认状态
 */
function whenModifyConclusion() {
  console.log('whenModifyConclusion')
  queryArgumentState()
  setFitView()
}

function replyIdea() {
  console.log('replyIdea')
  setDefaultValue()
}

function proposeIdea() {
  console.log('proposeIdea')
  setDefaultValue()
}

function proposeConclusion() {
  console.log('proposeConclusion')
  setDefaultValue()
}
const onMountedFunctionMap = {
  checkIdea: whenCheckIdea,
  checkConclusion: whenCheckConclusion,
  modifyIdea: whenModifyIdea,
  modifyConclusion: whenModifyConclusion,
  replyIdea: replyIdea,
  proposeIdea: proposeIdea,
  proposeConclusion: proposeConclusion,
}

onMounted(() => {
  const { condition } = props
  onMountedFunctionMap[condition]()
})

const handleTextualized = (): {
  nodes: Ref<NodeType[]>
  edges: Ref<EdgeType[]>
} => {
  const { condition, modifiedNodes, modifiedEdges, replyEdges, replyNodes } =
    props
  // 决定文本化的nodes和edges
  if (condition === 'modifyConclusion' || condition === 'modifyIdea') {
    return {
      nodes: ref(modifiedNodes),
      edges: ref(modifiedEdges),
    }
  } else if (condition === 'replyIdea') {
    return {
      nodes: ref(replyNodes),
      edges: ref(replyEdges),
    }
  } else if (condition === 'checkIdea' || condition === 'checkConclusion') {
    return {
      nodes: nodes,
      edges: edges,
    }
  } else {
    return {
      nodes: ref([]),
      edges: ref([]),
    }
  }
}

const { closed, contentStyle, handleToggleFold, MAX_CONTENT_WIDTH } = useTips({
  topicContent: props.topicContent,
  condition: props.condition,
  textualizedArgument: handleTextualized(),
})

const editNotification = (msg: string) => {
  ElNotification({
    title: '提示',
    message: msg,
    duration: 1000,
    type: 'warning',
  })
}

/**
 * 处理编辑论点
 */
const { addNode, resetState, removeNode } = useStateEdit({
  nodes: nodes,
  edges: edges,
  initState: DEFAULT_ARGUMENT_STATE,
  setNodes: setNodesValue,
  setEdges: setEdgesValue,
  onAddNodeTrigger: () => {
    setFitView()
  },
  onQualifierReadyTrigger: () => {
    editNotification('只能添加一次限定词')
  },
  onResetTrigger: () => {
    setFitView()
  },
  onNotQualifierReadyTrigger: () => {
    editNotification('请先添加限定词')
  },
  onRebuttalReadyTrigger() {
    editNotification('只能添加一次反驳')
  },
  onRemoveNodeTrigger() {
    setFitView()
  },
  onRemoveQualifierWithRebuttalTrigger() {
    editNotification('请先删除反驳')
  },
  onRemoveWarrantWithBackingTrigger() {
    editNotification('请先删除支撑')
  },
})
const onAddBacking = (payload: { nodeId: string; inputValue: string }) => {
  console.log('addBacking...')
  addNode(ArgumentType.Backing, payload)
}
const { onEdgesChange, onNodesChange, applyEdgeChanges, applyNodeChanges } =
  useVueFlow()
onEdgesChange(async changes => {
  /**
   * 不允许删除节点边
   */
  const chgs = changes.filter(change => change.type !== 'remove')

  applyEdgeChanges(chgs)
})

/**
 * 用来删除论证节点的对话框
 */
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

onNodesChange(async changes => {
  if (props.action === Action.Check) {
    /**
     * 查看时，不允许删除节点
     */
    const chgs = changes.filter(change => change.type !== 'remove')
    applyNodeChanges(chgs)
  } else {
    const nextChanges = []
    for (const change of changes) {
      if (change.type === 'remove') {
        const isConfirmed = await dialog.confirm(dialogMsg(change!.id))
        if (isConfirmed) {
          removeNode(change.id)
          return
        }
      } else {
        nextChanges.push(change)
      }
    }
    applyNodeChanges(nextChanges)
  }
})

const getArgumentState = () => {
  return {
    nodes,
    edges,
  }
}

const emit = defineEmits<{
  (
    e: 'onClickRejectBtn',
    payload: {
      replyNodes: NodeType[]
      replyEdges: EdgeType[]
    }
  ): void
  (
    e: 'onClickAcceptBtn',
    payload: {
      replyNodes: NodeType[]
      replyEdges: EdgeType[]
    }
  ): void
  (
    e: 'onClickModifyIdeaBtn',
    payload: { modifiedNodes: NodeType[]; modifiedEdges: EdgeType[] }
  ): void
  (
    e: 'onClickModifyConclusionBtn',
    payload: { modifiedNodes: NodeType[]; modifiedEdges: EdgeType[] }
  ): void
  (e: 'onUpdateArgumentFlowState'): void
  (e: 'onClickQuestion'): void
}>()

const handleClickRejectBtn = () => {
  emit('onClickRejectBtn', {
    replyNodes: nodes.value,
    replyEdges: edges.value,
  })
}

const handleClickAcceptBtn = () => {
  emit('onClickAcceptBtn', {
    replyNodes: nodes.value,
    replyEdges: edges.value,
  })
}

const handleClickModifyIdeaBtn = () => {
  /**
   * 在调整自己观点时将nodes和edges的状态传递出去，方便修改
   * 省去查后台接口
   */
  emit('onClickModifyIdeaBtn', {
    modifiedNodes: nodes.value,
    modifiedEdges: edges.value,
  })
}

const handleClickModifyConclusionBtn = () => {
  /**
   * 在调整自己观点时将nodes和edges的状态传递出去，方便修改
   * 省去查后台接口
   */
  emit('onClickModifyConclusionBtn', {
    modifiedNodes: nodes.value,
    modifiedEdges: edges.value,
  })
}
// const topicId = useQueryParam('topic_id')
// const getTopicId = () => {
//   return topicId.value
// }
// const getGroupId = () => {
//   return JSON.parse(localStorage.getItem('userInfo')!).group_id
// }

// const page = ref(1)
// const pageSize = ref(10)
// const peerIdeaList = ref<QueryGroupOptionResponse['list']>([])
// const total = ref(0)
// const noMore = ref(false)
// const { run: getOpinionList, loading: loadingMore } = useRequest({
//   apiFn: async () => {
//     return queryGroupOptionApi({
//       topic_id: getTopicId(),
//       group_id: getGroupId(),
//       page: page.value,
//       page_size: pageSize.value,
//     })
//   },
//   onSuccess(data: QueryGroupOptionResponse) {
//     console.log('onSuccess', data)
//     if (data.list.length === 0) {
//       ElNotification({
//         title: '提示',
//         message: '没有更多了',
//         duration: 1000,
//         type: 'warning',
//       })
//       noMore.value = true
//       return
//     }
//     peerIdeaList.value = [...peerIdeaList.value, ...data.list]
//     total.value = data.total
//   },
//   onFail(...args) {
//     console.log('onFail', args)
//   },
//   onError(...args) {
//     console.log('onError', args)
//   },
//   immediate: false,
// })

// const handleClickMore = () => {
//   if (noMore.value) return
//   page.value += 1
//   getOpinionList()
// }
// 2024/11/25 新增功能
// 显示当前Condition
const ConditionChineseMap: Record<Condition, string> = {
  checkIdea: '检查观点',
  checkConclusion: '检查小组结论',
  modifyIdea: '修改自己观点',
  modifyConclusion: '修改自己结论',
  replyIdea: '回复对方观点',
  proposeIdea: '提出自己观点',
  proposeConclusion: '提出小组结论',
}
const conditionText = computed(() => {
  return ConditionChineseMap[props.condition]
})

const isElementAllowedToEdit = computed(() => {
  return [
    'proposeIdea',
    'proposeConclusion',
    'modifyIdea',
    'modifyConclusion',
    'replyIdea',
  ].includes(props.condition)
})

const onNotAllowed = () => {
  ElNotification({
    title: '提示',
    message: '该论点仅供查看',
    duration: 1000,
    type: 'warning',
  })
}

// 右下角使用苏格拉底提问法作为Tips
const socraticQuestioningTips = [
  '前提正确吗?',
  '结论正确吗?',
  '前提和结论之间逻辑是否正确吗?',
  '你的论证有没有局限性?',
]
interface RenderButtonListItem {
  btnText: string
  btnColor: string
  confirm?: boolean
  confirmText?: string
  onConfirm?: () => void
  onClick: () => void
  isRender: () => boolean
}

// 修改或者发布观点时的按钮列表
// 修改结论+修改
const renderReviseConditionList: RenderButtonListItem[] = [
  {
    btnText: '重置论证',
    btnColor: '#03346E',
    confirm: true,
    confirmText: '确定重置?',
    onConfirm() {
      resetState()
    },
    onClick() {},
    isRender: () => {
      return true
    },
  },
  {
    btnText: '自动布局',
    btnColor: '#FF8225',
    confirm: false,
    onClick() {
      setFitView()
    },
    isRender: () => {
      return true
    },
  },
  {
    btnText: '加入辩护',
    btnColor: '#88D66C',
    onClick() {
      addNode(ArgumentType.Warrant)
    },
    isRender: () => {
      return true
    },
  },
  {
    btnText: '加限定词',
    btnColor: '#4535C1',
    onClick() {
      addNode(ArgumentType.Qualifier)
    },
    isRender: () => {
      return true
    },
  },
  {
    btnText: '增加反驳',
    btnColor: '#DC0083',
    onClick() {
      addNode(ArgumentType.Rebuttal)
    },
    isRender: () => {
      return true
    },
  },
]
// 查看观点时的BtnList
const renderCheckIdeaConditionList: RenderButtonListItem[] = [
  {
    btnText: '支持观点',
    btnColor: '#88D66C',
    confirmText: '你确定要跳转至观点编辑页面吗?',
    confirm: true,
    onClick() {},
    onConfirm() {
      handleClickAcceptBtn()
    },
    isRender() {
      return !props.InSelfIdea
    },
  },
  {
    btnText: '反对观点',
    btnColor: '#FF2929',
    confirmText: '你确定要跳转至观点编辑页面吗?',
    confirm: true,
    onClick() {},
    onConfirm() {
      handleClickRejectBtn()
    },
    isRender() {
      return !props.InSelfIdea
    },
  },
  {
    btnText: '提个问题',
    btnColor: '#8B5DFF',
    confirm: false,
    onClick() {
      console.log('提个问题...')
      emit('onClickQuestion')
    },
    isRender() {
      return !props.InSelfIdea
    },
  },
  {
    btnText: '修改观点',
    btnColor: '#3D3BF3',
    confirmText: '你确定要修改观点吗?',
    confirm: true,
    onClick() {},
    onConfirm() {
      handleClickModifyIdeaBtn()
    },
    isRender() {
      return props.InSelfIdea
    },
  },
]
// 查看小组结论并且是自己的组
const renderCheckConclusionConditionList: RenderButtonListItem[] = [
  {
    btnText: '修改结论',
    btnColor: '#88D66C',
    confirmText: '确定要修改小组总结的观点吗?',
    confirm: true,
    onClick() {},
    onConfirm() {
      handleClickModifyConclusionBtn()
    },
    isRender() {
      return true
    },
  },
]

const renderBtnList = computed(() => {
  console.log('render...')
  let list: RenderButtonListItem[] = []
  if (props.condition === 'checkIdea') {
    console.log(1)
    list = renderCheckIdeaConditionList
  } else if (
    [
      'modifyConclusion',
      'modifyIdea',
      'replyIdea',
      'proposeConclusion',
      'proposeIdea',
    ].includes(props.condition)
  ) {
    console.log(2)
    list = renderReviseConditionList
  } else if (props.condition === 'checkConclusion' && props.InSelfGroup) {
    console.log(3)
    list = renderCheckConclusionConditionList
  } else {
    console.log(4)
    list = []
  }
  return list.filter(item => item.isRender())
})
class CheckGuideState {
  static checkStatePropose() {
    return props.condition === 'proposeIdea' || props.condition === 'modifyIdea'
  }
  static checkStateAgree() {
    return props.condition === 'replyIdea' && props.reply === 'approve'
  }
  static checkStateDisagree() {
    return props.condition === 'replyIdea' && props.reply === 'reject'
  }
  static checkStateSummary() {
    return (
      props.condition === 'proposeConclusion' ||
      props.condition === 'modifyConclusion'
    )
  }
}
// 论证提示词状态
const argumentGuideState: ComputedRef<
  'propose' | 'agree' | 'disagree' | 'summary'
> = computed(() => {
  if (CheckGuideState.checkStatePropose()) {
    return 'propose'
  } else if (CheckGuideState.checkStateAgree()) {
    return 'agree'
  } else if (CheckGuideState.checkStateDisagree()) {
    return 'disagree'
  } else if (CheckGuideState.checkStateSummary()) {
    return 'summary'
  } else {
    return 'propose'
  }
})

defineExpose({
  getArgumentState,
})
</script>

<template>
  <div class="vue-flow-layout">
    <!-- 当前状态 -->
    <div class="vue-flow-layout-header">
      <n-text type="primary" style="font-size: 16px"> 当前状态: </n-text>
      <n-text type="primary" style="font-size: 16px">
        {{ conditionText }}
      </n-text>
    </div>
    <!-- VueFlow -->
    <VueFlow
      :nodes="nodes"
      :edges="edges"
      ref="argumentVueFlowRef"
      :apply-default="false"
    >
      <template #node-element="props">
        <ElementComponent
          :nodeId="props.id"
          :_type="props.data._type"
          :visible="isElementAllowedToEdit"
          :argumentGuideType="argumentGuideState"
          v-model="props.data.inputValue"
          @addBacking="onAddBacking"
          @notAllowed="onNotAllowed"
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

      <!-- 右上角显示的按钮 -->
      <Panel
        position="top-right"
        class="button-group-container"
        v-if="renderBtnList.length > 0"
      >
        <div v-for="item in renderBtnList">
          <div v-if="item.confirm">
            <el-popconfirm :title="item.confirmText" @confirm="item.onConfirm">
              <template #reference>
                <el-button plain style="margin-left: 0" :color="item.btnColor">
                  {{ item.btnText }}
                </el-button>
              </template>
            </el-popconfirm>
          </div>
          <div v-else>
            <el-button
              plain
              style="margin-left: 0"
              :color="item.btnColor"
              @click="item.onClick"
              >{{ item.btnText }}</el-button
            >
          </div>
        </div>
      </Panel>

      <!-- 反馈 -->
      <Panel v-if="showFeedBack" position="top-left" class="feedback-tips">
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

      <!-- 右下角TIPDS -->
      <Panel
        position="bottom-right"
        class="argument-text"
        :style="contentStyle"
      >
        <ArrowIcon
          class="arrow"
          @click="handleToggleFold"
          :class="
            contentStyle.width === MAX_CONTENT_WIDTH ? 'arrow-up' : 'arrow-down'
          "
        ></ArrowIcon>
        <!-- 苏格拉底提示框架 -->
        <section v-if="!closed">
          <div>
            <h3 class="argument-text-title">考虑回答以下问题</h3>
          </div>
          <ul>
            <li v-for="t in socraticQuestioningTips" :key="t">
              {{ t }}
            </li>
          </ul>
        </section>
      </Panel>
    </VueFlow>
  </div>
</template>

<style>
/* import the necessary styles for Vue Flow to work */
@import '@vue-flow/core/dist/style.css';

/* import the default theme, this is optional but generally recommended */
@import '@vue-flow/core/dist/theme-default.css';

.vue-flow-layout {
  position: relative;
  width: 100%;
  height: 100%;
}
.vue-flow-layout-header {
  position: absolute;
  box-sizing: content-box;
  background-color: #fff;
  box-shadow: 1px 1px 2px 1px rgba(0, 0, 0, 0.08);
  border-radius: 5px;
  padding: 10px;
  text-align: center;
  height: 30px;
  line-height: 30px;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
}

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
  /* position: relative; */
  box-sizing: border-box;
  box-shadow: 0 0 2px 1px rgba(0, 0, 0, 0.08);
  padding: 30px;
  background-color: #fff;
  width: 400px;
  height: 200px;
  overflow-x: auto;
  overflow-y: hidden;
  /* overflow: auto; */
}
.argument-text-container {
  padding: 20px;
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
  transform: rotate(90deg) translateX(-50%);
  right: calc(50% - 7px);
  top: 10px;
}
</style>
