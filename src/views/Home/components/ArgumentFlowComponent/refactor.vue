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
import { queryNodeContentApi } from '@/apis/flow/index.ts'
import { QueryNodeContentData } from '@/apis/flow/type'
import DEFAULT_ARGUMENT_STATE from './data.ts'
import useTips from './hooks/useTips'
import ArrowIcon from './components/icon/index.vue'
import useStateEdit from './hooks/useStateEdit.ts'
import Dialog from './components/dialog/index.vue'
import { useDialog } from './hooks/dialog/index'

const props = withDefaults(
  defineProps<{
    InSelfGroup: boolean // 标记是否是自己的组
    InSelfIdea: boolean // 标记是否是自己的观点
    role: Role // 标记当前组件的角色，Idea或者Conclusion
    action: Action // 标记组件的动作，是否修改(Modify)或者查看观点（Check）
    showFeedBack: boolean // 是否显示反馈
    focusNodeId: string // 观点节点id
    reply: 'none' | 'reject' | 'approve' // 标记当前节点的回复状态
    topicContent: string // 正在发表观点的内容
  }>(),
  {
    InSelfGroup: false,
    InSelfIdea: false,
    role: Role.Idea,
    action: Action.Check,
    showFeedBack: true,
    focusNodeId: '',
    topicContent: '',
  }
)

const [nodes, setNodesValue] = useState<NodeType[]>([])
const [edges, setEdgesValue] = useState<EdgeType[]>([])

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
const { run: queryArgumentState } = useRequest({
  apiFn: async () => {
    return await queryNodeContentApi(+props.focusNodeId)
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
  queryArgumentState()
}

/**
 * 修改观点时，如果有聚焦的Node的id，则会根据聚焦的Node的id去查询节点内容
 * 如果没有聚焦的Node的id，则设置默认状态
 */
function whenModifyIdea() {
  console.log('whenModifyIdea')
  const { focusNodeId } = props
  if (focusNodeId) {
    queryArgumentState()
  } else {
    setDefaultValue()
  }
}

/**
 * 修改观点时，也会根据聚焦的Node的id去查询节点内容
 * 如果没有聚焦的Node的id，则设置默认状态
 */
function whenModifyConclusion() {
  console.log('whenModifyConclusion')
}

onMounted(() => {
  const { role, action } = props
  if (role === Role.Idea && action === Action.Check) {
    whenCheckIdea()
  } else if (role === Role.Conclusion && action === Action.Check) {
    whenCheckConclusion()
  } else if (role === Role.Idea && action === Action.Modify) {
    whenModifyIdea()
  } else if (role === Role.Conclusion && action === Action.Modify) {
    whenModifyConclusion()
  }
})

/**
 * 处理右下角的提示词
 */
const { content, contentStyle, handleToggleFold, MAX_CONTENT_WIDTH, title } =
  useTips({
    action: props.action,
    reply: props.reply,
    topicContent: props.topicContent,
    textualizedArgument: {
      nodes,
      edges,
    },
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
</script>

<template>
  <!-- :apply-default="false" -->
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
        :visible="true"
        v-model="props.data.inputValue"
        @addBacking="onAddBacking"
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
      v-if="props.action === Action.Modify"
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
      v-if="props.action === Action.Check"
    >
      <!-- 不能支持或者反对自己的观点 -->
      <el-popconfirm
        title="你确定要跳转至观点编辑页面吗?"
        @confirm=""
        v-if="!props.InSelfIdea"
      >
        <template #reference>
          <el-button plain style="margin-left: 0" type="success"
            >支持观点</el-button
          >
        </template>
      </el-popconfirm>
      <el-popconfirm
        title="你确定要跳转至观点编辑页面吗?"
        @confirm=""
        v-if="!props.InSelfIdea"
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
        @confirm=""
        v-if="props.InSelfIdea"
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
      v-if="props.role === Role.Conclusion && props.InSelfGroup"
    >
      <el-popconfirm title="确定要修改小组总结的观点吗?" @confirm="">
        <template #reference>
          <el-button plain style="margin-left: 0" type="warning"
            >修改总结</el-button
          >
        </template>
      </el-popconfirm>
    </Panel>

    <!-- 反馈 -->
    <Panel v-if="props.showFeedBack" position="top-left" class="feedback-tips">
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
    <Panel position="bottom-right" class="argument-text" :style="contentStyle">
      <section style="width: 100%; height: 100%; position: relative">
        <ArrowIcon
          class="arrow"
          @click="handleToggleFold"
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
