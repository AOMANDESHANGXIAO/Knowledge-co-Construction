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
import PeerIdeaContainer from './components/peerIdeaContainer/index.vue'
import { queryGroupOptionApi } from '@/apis/flow/index.ts'
import { QueryGroupOptionResponse } from '@/apis/flow/type.ts'
import useQueryParam from '@/hooks/router/useQueryParam.ts'
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

const { content, contentStyle, handleToggleFold, MAX_CONTENT_WIDTH, title } =
  useTips({
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
const topicId = useQueryParam('topic_id')
const getTopicId = () => {
  return topicId.value
}
const getGroupId = () => {
  return JSON.parse(localStorage.getItem('userInfo')!).group_id
}

const page = ref(1)
const pageSize = ref(10)
const peerIdeaList = ref<QueryGroupOptionResponse['list']>([])
const total = ref(0)
const noMore = ref(false)
const { run: getOpinionList, loading: loadingMore } = useRequest({
  apiFn: async () => {
    return queryGroupOptionApi({
      topic_id: getTopicId(),
      group_id: getGroupId(),
      page: page.value,
      page_size: pageSize.value,
    })
  },
  onSuccess(data: QueryGroupOptionResponse) {
    console.log('onSuccess', data)
    if (data.list.length === 0) {
      ElNotification({
        title: '提示',
        message: '没有更多了',
        duration: 1000,
        type: 'warning',
      })
      noMore.value = true
      return
    }
    peerIdeaList.value = [...peerIdeaList.value, ...data.list]
    total.value = data.total
  },
  onFail(...args) {
    console.log('onFail', args)
  },
  onError(...args) {
    console.log('onError', args)
  },
  immediate: false,
})

const handleClickMore = () => {
  if (noMore.value) return
  page.value += 1
  getOpinionList()
}
// 2024/11/25 新增功能
// 显示当前Condition
const ConditionChineseMap: Record<Condition, string> = {
  checkIdea: '检查自己观点',
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

      <!-- 当选择修改观点时，可以通过这些按钮来进行修改-->
      <Panel
        position="top-right"
        class="button-group-container"
        v-if="
          condition === 'modifyConclusion' ||
          condition === 'modifyIdea' ||
          condition === 'replyIdea' ||
          condition === 'proposeConclusion' ||
          condition === 'proposeIdea'
        "
      >
        <el-popconfirm
          title="你确定要重置论证?"
          @confirm="
            () => {
              resetState()
            }
          "
        >
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
          @click="
            () => {
              setFitView()
            }
          "
          >自动布局</el-button
        >

        <el-button
          plain
          style="margin-left: 0"
          color="#88D66C"
          @click="
            () => {
              addNode(ArgumentType.Warrant)
            }
          "
          >加入辩护</el-button
        >

        <el-button
          plain
          style="margin-left: 0"
          color="#4535C1"
          @click="
            () => {
              addNode(ArgumentType.Qualifier)
            }
          "
          >加限定词</el-button
        >

        <el-button
          plain
          style="margin-left: 0"
          color="#DC0083"
          @click="
            () => {
              addNode(ArgumentType.Rebuttal)
            }
          "
          >增加反驳</el-button
        >
      </Panel>

      <!-- 在查看观点时可以选择支持观点或者反对观点, 如果是学生自己的观点，那么还可以修改观点 -->
      <Panel
        position="top-right"
        class="button-group-container"
        v-if="condition === 'checkIdea'"
      >
        <!-- 不能支持或者反对自己的观点 -->
        <el-popconfirm
          title="你确定要跳转至观点编辑页面吗?"
          @confirm="handleClickAcceptBtn"
          v-if="!InSelfIdea"
        >
          <template #reference>
            <el-button plain style="margin-left: 0" type="success"
              >支持观点</el-button
            >
          </template>
        </el-popconfirm>
        <el-popconfirm
          title="你确定要跳转至观点编辑页面吗?"
          @confirm="handleClickRejectBtn"
          v-if="!InSelfIdea"
        >
          <template #reference>
            <el-button plain style="margin-left: 0" type="danger"
              >反对观点</el-button
            >
          </template>
        </el-popconfirm>
        <!-- 只能修改自己的观点 -->
        <el-popconfirm
          title="你确定要修改观点吗?"
          @confirm="handleClickModifyIdeaBtn"
          v-if="InSelfIdea"
        >
          <template #reference>
            <el-button plain style="margin-left: 0" type="warning">
              修改观点
            </el-button>
          </template>
        </el-popconfirm>
      </Panel>

      <Panel
        position="top-right"
        class="button-group-container"
        v-if="condition === 'checkConclusion' && InSelfGroup"
      >
        <el-popconfirm
          title="确定要修改小组总结的观点吗?"
          @confirm="handleClickModifyConclusionBtn"
        >
          <template #reference>
            <el-button plain style="margin-left: 0" type="warning"
              >修改总结</el-button
            >
          </template>
        </el-popconfirm>
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
        <section style="width: 100%; height: 100%; position: relative">
          <ArrowIcon
            class="arrow"
            @click="handleToggleFold"
            :class="
              contentStyle.width === MAX_CONTENT_WIDTH
                ? 'arrow-up'
                : 'arrow-down'
            "
          ></ArrowIcon>
          <h3 class="argument-text-title" :class="props.reply">
            {{ title }}
          </h3>
          <div class="argument-text-content" v-html="content"></div>
          <section
            class="show-peer-option-container"
            v-if="
              [
                'checkConclusion',
                'modifyConclusion',
                'proposeConclusion',
              ].includes(condition)
            "
          >
            <h3 class="show-peer-option-title">其他小组成员观点</h3>
            <div class="show-peer-option-content">
              <PeerIdeaContainer
                v-for="item in peerIdeaList"
                :key="item.id"
                :color="item.group_color"
                :name="item.nickname"
                :ideaContent="item.content"
                :showEllipsis="false"
              ></PeerIdeaContainer>
            </div>
            <div style="margin-bottom: 20px; text-align: center">
              <el-button
                type="primary"
                plain
                text
                :loading="loadingMore"
                :disabled="noMore"
                @click="handleClickMore"
                >{{ noMore ? '没有更多了' : '查看更多...' }}</el-button
              >
            </div>
          </section>
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
  box-shadow: 0 0 2px 1px rgba(0, 0, 0, 0.08);
  padding: 10px;
  background-color: #fff;
  width: 400px;
  height: 200px;
  overflow: auto;
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
