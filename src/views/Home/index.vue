<script setup lang="ts">
import flowComponent from '@/components/vueFlow/index.vue'
import { LayoutDirection } from '@/components/vueFlow/type.ts'
import Icon from '@/components/Icons/HomePageIcon/index.vue'
import { IconName } from '@/components/Icons/HomePageIcon/type.ts'
import argumentFlowComponent from './components/ArgumentFlowComponent/refactor.vue'
import { useUserStore } from '../../store/modules/user/index'
import useQueryParam from '@/hooks/router/useQueryParam'
import useRefresh from '../../hooks/Element/useRefresh'
import { Role, Action } from './components/ArgumentFlowComponent/type.ts'
import useState from '@/hooks/State/useState.ts'
import useRequest from '@/hooks/Async/useRequest'
import { queryTopicContentApi } from '@/apis/manageTalk'
import { TopicContent } from '@/apis/manageTalk/type'
import useSubmit from './useSubmit.ts'
import { GroupNodeProps } from '@/components/vueFlow/components/groupNode/type.ts'
import type {
  NodeType,
  EdgeType,
} from './components/ArgumentFlowComponent/type.ts'
import miniDashBoard from './components/DashBoardMini/index.vue'
import fullScreenDashBoard from './components/DashBoardFullScreen/index.vue'
import type { ComposeOption } from 'echarts/core'
import type {
  // 系列类型的定义后缀都为 SeriesOption
  BarSeriesOption,
  RadarSeriesOption,
  GraphSeriesOption,
} from 'echarts/charts'
import { queryDashBoard } from '@/apis/flow'
import { QueryDashBoardResponse, TimeLineItem } from '@/apis/flow/type'
import useEvaluation from './hooks/useEvaluation'
import _ from 'lodash'
const { getOneUserInfo } = useUserStore()

const [dialogVisible, setdialogVisible] = useState(false)

const { key, refresh } = useRefresh()

/**
 * 这个方法用来打开论证图编辑器
 * 1. 首先可视化dialog
 * 2. 直接更新组件
 */
const openArgumentEditor = () => {
  setdialogVisible(true)
  refresh()
}

/**
 * 传递给argumentFlowComponent组件的参数
 */
const requestParams = reactive({
  focusNodeId: '',
})

const setRequestParams = (payload: { focusNodeId: string }) => {
  requestParams.focusNodeId = payload.focusNodeId
}

/**
 * 控制argumentFlowComponent组件状态的参数
 */

const controller = ref<{
  role: Role
  action: Action
  InSelfGroup: boolean
  InSelfIdea: boolean
  reply: 'none' | 'reject' | 'approve'
}>({
  role: Role.Idea,
  action: Action.Check,
  InSelfGroup: false,
  InSelfIdea: false,
  reply: 'none',
})

const setControllerState = (
  role: Role,
  action: Action,
  InSelfGroup?: boolean,
  InSelfIdea?: boolean,
  reply?: 'none' | 'reject' | 'approve'
) => {
  controller.value.role = role
  controller.value.action = action
  if (typeof InSelfGroup === 'boolean') {
    controller.value.InSelfGroup = InSelfGroup
  }
  if (typeof InSelfIdea === 'boolean') {
    controller.value.InSelfIdea = InSelfIdea
  }
  reply && (controller.value.reply = reply)
}

/**
 * 控制论证图编辑器渲染状态的参数
 */
const [condition, setCondition] = useState<
  | 'chechIdea'
  | 'checkConclusion'
  | 'modifyIdea'
  | 'modifyConclusion'
  | 'replyIdea'
  | 'proposeIdea'
  | 'proposeConclusion'
>('chechIdea')

const onClickGroupNode = (payload: {
  groupId: string
  nodeId: string
  groupConclusion: string
}) => {
  setRequestParams({ focusNodeId: payload.nodeId })
  // 打开论证图编辑器
  // 判断是否在本组
  const slefGroupId = getOneUserInfo('group_id') as string
  const isSelfGroup = payload.groupId === String(slefGroupId)
  setControllerState(Role.Conclusion, Action.Check, isSelfGroup, false)
  setCondition('checkConclusion') // 点击小组节点时，论证图编辑器渲染为查看小组结论
  openArgumentEditor()
}

const onClickIdeaNode = (payload: { nodeId: string; studentId: string }) => {
  setRequestParams({ focusNodeId: payload.nodeId })
  console.log('被选中节点的NodeId', payload.nodeId)
  console.log('被选中节点的studentId', payload.studentId)
  console.log('用户的id', getOneUserInfo('id'))
  const slefStudentId = getOneUserInfo('id') as string
  const isSelfIdea = payload.studentId === String(slefStudentId)
  setControllerState(Role.Idea, Action.Check, false, isSelfIdea)
  setCondition('chechIdea') // 点击观点节点时，论证图编辑器渲染为查看观点
  openArgumentEditor()
}

const handleClickProposeIdeaBtn = () => {
  const inSelfGroup = false
  const inSelfIdea = true
  // 设置论证图编辑器请求的参数，为空字符串表示不需要查询
  setRequestParams({ focusNodeId: '' })
  setControllerState(Role.Idea, Action.Modify, inSelfGroup, inSelfIdea)
  setCondition('proposeIdea') // 点击发表观点按钮时，论证图编辑器渲染为发表观点
  openArgumentEditor()
}

/**
 * 查询topic话题信息
 */
const topicContent = ref('')
const topicId = useQueryParam<number>('topic_id')
useRequest({
  apiFn: async () => await queryTopicContentApi(topicId.value),
  onSuccess: (res: TopicContent) => {
    topicContent.value = res.topic_content
  },
  onError: () => {
    ElNotification({
      title: 'Error',
      message: '获取主题内容失败',
      type: 'error',
      position: 'bottom-right',
    })
  },
  immediate: true,
})

/**
 * 处理论证图提交
 */

const argumentFlowRef = ref<InstanceType<typeof argumentFlowComponent> | null>(
  null
)
const vueFlowRef = ref<InstanceType<typeof flowComponent> | null>(null)

const group_id = getOneUserInfo('group_id') as string
/**
 * 这个函数被用来拿到学生自己的小组节点
 * @returns
 */
const getGroupNode = () => {
  const { nodes } = vueFlowRef.value!.getState()
  console.log('nodes', nodes)
  console.log('group_id', group_id)

  const groupNode = nodes.find(node => {
    if (node.type !== 'group') return false
    const data = node.data as GroupNodeProps
    if (String(data.group_id) === String(group_id)) return true
  })
  return groupNode
}

const handleClickConclusionBtn = () => {
  // 做一个判断，如果没有groupConclusion，则状态为提出小组结论
  // @ts-ignore
  const groupNode = getGroupNode()
  console.log('groupNode', groupNode)
  const data = groupNode!.data as GroupNodeProps
  if (data.groupConclusion) {
    setCondition('modifyConclusion')
  } else {
    // 否则为修改小组结论
    setCondition('proposeConclusion')
  }

  openArgumentEditor()
}

/**
 * 记录正在回复的观点
 */
const replyNodes: NodeType[] = []
const replyEdges: EdgeType[] = []
const onClickRejectBtn = (payload: {
  replyNodes: NodeType[]
  replyEdges: EdgeType[]
}) => {
  console.log('点击了拒绝按钮')
  setControllerState(Role.Idea, Action.Modify, false, false, 'reject')
  setRequestParams({ focusNodeId: '' })
  setCondition('replyIdea')
  Object.assign(replyNodes, payload.replyNodes)
  Object.assign(replyEdges, payload.replyEdges)
  openArgumentEditor()
}

const onClickApproveBtn = (payload: {
  replyNodes: NodeType[]
  replyEdges: EdgeType[]
}) => {
  console.log('点击了同意按钮')
  setControllerState(Role.Idea, Action.Modify, false, false, 'approve')
  setRequestParams({ focusNodeId: '' })
  setCondition('replyIdea')
  Object.assign(replyNodes, payload.replyNodes)
  Object.assign(replyEdges, payload.replyEdges)
  openArgumentEditor()
}

/**
 * 记录修改的观点
 */
const modifiedNodes: NodeType[] = []
const modifiedEdges: EdgeType[] = []
const onClickModifyIdeaBtn = (payload: {
  modifiedNodes: NodeType[]
  modifiedEdges: EdgeType[]
}) => {
  setControllerState(Role.Idea, Action.Modify, false, false)
  setCondition('modifyIdea')
  Object.assign(modifiedNodes, payload.modifiedNodes)
  Object.assign(modifiedEdges, payload.modifiedEdges)
  openArgumentEditor()
}

const onClickModifyConclusionBtn = (payload: {
  modifiedNodes: NodeType[]
  modifiedEdges: EdgeType[]
}) => {
  setControllerState(Role.Conclusion, Action.Modify, false, false)
  setCondition('modifyConclusion')
  Object.assign(modifiedNodes, payload.modifiedNodes)
  Object.assign(modifiedEdges, payload.modifiedEdges)
  openArgumentEditor()
}

/**
 * 请求参数
 */
const studentId = getOneUserInfo('id') as string

const validator = (nodes: NodeType[]) => {
  for (const node of nodes) {
    if (!node.data.inputValue) {
      ElNotification({
        title: 'Error',
        message: '请输入观点内容',
        type: 'error',
        position: 'bottom-right',
      })
      return false
    }
  }

  return true
}

const {
  submitProposeIdea,
  submitModifyIdea,
  submitReplyIdea,
  submitProposeGroupConclusion,
  submitModifyGroupConclusion,
} = useSubmit({
  onSuccess: () => {
    ElNotification({
      title: 'Success',
      message: '提交成功',
      type: 'success',
      position: 'bottom-right',
    })
    setdialogVisible(false)
    vueFlowRef.value?.refreshData()
  },
  onFail() {
    ElNotification({
      title: 'Error',
      message: '提交失败',
      type: 'error',
      position: 'bottom-right',
    })
  },
})

const handleSumbit = () => {
  const { nodes, edges } = argumentFlowRef.value!.getArgumentState()

  const nodesValue = nodes.value
  const edgesValue = edges.value
  if (!validator(nodesValue)) return

  switch (condition.value) {
    case 'modifyIdea': {
      submitModifyIdea({
        topic_id: topicId.value,
        student_id: +studentId,
        modifyNodeId: +requestParams.focusNodeId,
        nodes: nodesValue,
        edges: edgesValue,
      })
      break
    }
    case 'modifyConclusion': {
      console.log('修改小组结论')
      const groupNode = getGroupNode()

      if (!groupNode) return
      const groupNodeId = groupNode.id
      submitModifyGroupConclusion({
        student_id: +studentId,
        groupNodeId: groupNodeId,
        nodes: nodesValue,
        edges: edgesValue,
      })
      break
    }
    case 'replyIdea': {
      if (controller.value.reply === 'none') return
      submitReplyIdea({
        replyType: controller.value.reply as 'approve' | 'reject',
        replyNodeId: +requestParams.focusNodeId,
        topic_id: topicId.value,
        student_id: +studentId,
        nodes: nodesValue,
        edges: edgesValue,
      })
      break
    }
    case 'proposeIdea': {
      submitProposeIdea({
        topic_id: topicId.value,
        student_id: +studentId,
        nodes: nodesValue,
        edges: edgesValue,
      })
      break
    }
    case 'proposeConclusion': {
      const groupNode = getGroupNode()

      if (!groupNode) return
      const groupNodeId = groupNode.id

      submitProposeGroupConclusion({
        student_id: +studentId,
        groupNodeId: groupNodeId,
        nodes: nodesValue,
        edges: edgesValue,
      })
      break
    }
  }
}

const handleLayout = (direction: LayoutDirection) => {
  vueFlowRef.value?.handleLayout(direction)
}

const handleRereshFlowData = () => {
  vueFlowRef.value?.refreshData()
}

/**
 * 点击确认时触发
 */
const handleOK = () => {
  if (
    condition.value === 'chechIdea' ||
    condition.value === 'checkConclusion'
  ) {
    // 关闭弹窗
    setdialogVisible(false)
  } else {
    // 提交
    handleSumbit()
  }
}

/**
 * 处理dashBoard
 */
const [dashBoardVisible, setDashBoardVisible] = useState(false)
const currentProgress = ref<TimeLineItem['action']>('close')
const progressTextMap = {
  close: '讨论完成',
  summary: '总结观点',
  feedback: '同伴反馈',
  propose: '发表观点',
}
const progressText = computed(() => progressTextMap[currentProgress.value])
const actionWeightMap = {
  close: 4,
  summary: 3,
  feedback: 2,
  propose: 1,
}
const timeLineList = ref<
  {
    type: 'success' | 'info' | 'warning' | 'error'
    title: string
    content: string
    time: string
  }[]
>([])

const onCheckDetail = () => {
  setDashBoardVisible(true)
}

/**
 * 查询仪表盘
 */
const { run: getDashBoardData } = useRequest({
  apiFn: async () => {
    return await queryDashBoard({
      topic_id: topicId.value,
      student_id: getOneUserInfo('id'),
      group_id: getOneUserInfo('group_id'),
    })
  },
  onSuccess(response: QueryDashBoardResponse) {
    setDashBoardData({
      radar: {
        ...response.radarOption,
      },
      graph: {
        ...response.graphOption,
      },
      bar: {
        ...response.barOption,
      },
    })
    // console.log('timeLineList =>', response.timeLineList)
    const sortedTimeLineList = _.orderBy(
      response.timeLineList,
      item => actionWeightMap[item.action],
      ['asc']
    )
    currentProgress.value =
      sortedTimeLineList[sortedTimeLineList.length - 1]?.action || 'close'
    timeLineList.value = sortedTimeLineList.map(item => {
      return {
        type: item.action === 'close' ? 'success' : 'info',
        title: item.action,
        content:
          item.action === currentProgress.value
            ? `当前阶段: ${progressTextMap[item.action]}`
            : progressTextMap[item.action],
        time: item.created_time,
      }
    })
  },
  immediate: true,
})

const [dashBoardData, setDashBoardData] = useState<{
  radar: ComposeOption<RadarSeriesOption>
  graph: ComposeOption<GraphSeriesOption>
  bar: ComposeOption<BarSeriesOption>
}>({
  radar: {},
  graph: {},
  bar: {},
})

const evaluationData = computed(() => {
  return {
    argumentData: dashBoardData.value.radar,
    interactionData: dashBoardData.value.graph,
    groupData: dashBoardData.value.bar,
  }
})

// @ts-ignore
const {
  getEvaluatedArgument,
  getEvaluatedGroupContribution,
  getEvaluatedInteraction,
  // @ts-ignore
} = useEvaluation(evaluationData)

const dashBoardRenderList = ref<
  {
    title: string
    option:
      | ComposeOption<BarSeriesOption>
      | ComposeOption<GraphSeriesOption>
      | ComposeOption<RadarSeriesOption>
    type: 'radar' | 'graph' | 'bar'
  }[]
>([])

watch(
  () => dashBoardData.value,
  (newVal, oldVal) => {
    if (_.isEqual(newVal, oldVal)) return
    dashBoardRenderList.value = [
      {
        title: '论证元素',
        option: dashBoardData.value.radar,
        type: 'radar',
      },
      {
        title: '互动',
        option: dashBoardData.value.graph,
        type: 'graph',
      },
      {
        title: '团队',
        option: dashBoardData.value.bar,
        type: 'bar',
      },
    ]
  }
)
type AlertType = {
  title: string
  type: 'info' | 'success' | 'warning' | 'error'
  suggestions: string[]
}
const alertList = ref<AlertType[]>([])

watch(
  () => dashBoardData.value,
  (newVal, oldVal) => {
    if (_.isEqual(newVal, oldVal)) return
    alertList.value = [
      getEvaluatedArgument() || {
        title: '论证元素',
        type: 'info',
        suggestions: ['加载中...'],
      },
      getEvaluatedInteraction() || {
        title: '论证元素',
        type: 'info',
        suggestions: ['加载中...'],
      },
      getEvaluatedGroupContribution() || {
        title: '论证元素',
        type: 'info',
        suggestions: ['加载中...'],
      },
    ]
  }
)
</script>

<template>
  <!-- 论点编辑器dialog -->
  <section class="dialog-container" v-show="dialogVisible">
    <el-dialog v-model="dialogVisible" width="1200" :append-to-body="true">
      <div class="argument-flow-container">
        <argumentFlowComponent
          :modified-edges="modifiedEdges"
          :modified-nodes="modifiedNodes"
          :reply-edges="replyEdges"
          :reply-nodes="replyNodes"
          :key="key"
          ref="argumentFlowRef"
          :condition="condition"
          :role="controller.role"
          :action="controller.action"
          :InSelfGroup="controller.InSelfGroup"
          :InSelfIdea="controller.InSelfIdea"
          :reply="controller.reply"
          :focus-node-id="requestParams.focusNodeId"
          :show-feed-back="true"
          :topic-content="topicContent"
          @on-click-accept-btn="onClickApproveBtn"
          @on-click-reject-btn="onClickRejectBtn"
          @on-click-modify-idea-btn="onClickModifyIdeaBtn"
          @on-click-modify-conclusion-btn="onClickModifyConclusionBtn"
        ></argumentFlowComponent>
      </div>
      <div class="button-footer-container">
        <el-button
          @click="
            () => {
              setdialogVisible(false)
            }
          "
          plain
          color="#FF8225"
          style="margin-left: 10px"
        >
          取消
        </el-button>
        <el-button
          style="margin-left: 10px"
          color="#FF8225"
          @click="handleOK"
          >{{ '确定' }}</el-button
        >
      </div>
    </el-dialog>
  </section>

  <!-- 知识建构图谱 -->
  <div class="vue-flow-container">
    <flow-component
      ref="vueFlowRef"
      :update-vue-flow-effects="
        () => {
          getDashBoardData()
        }
      "
      @onClickGroupNode="onClickGroupNode"
      @onClickIdeaNode="onClickIdeaNode"
    >
      <!-- 右上角插槽放一些控制按钮 -->
      <template #top-right>
        <div class="layout-panel">
          <button title="发表观点" @click="handleClickProposeIdeaBtn">
            <Icon :name="IconName.Idea" />
          </button>
          <button title="总结观点" @click="handleClickConclusionBtn">
            <Icon :name="IconName.Summary" />
          </button>
          <button
            title="刷新"
            @click="
              () => {
                // 更新VueFlow的Data
                handleRereshFlowData()
                // // 更新dashBoard数据
                // getDashBoardData()
              }
            "
          >
            <Icon :name="IconName.Refresh" />
          </button>
          <button title="返回首页" @click="">
            <Icon :name="IconName.Home" />
          </button>
          <button title="设置" @click="">
            <Icon :name="IconName.Setting" />
          </button>
          <button
            title="垂直排列"
            @click="
              () => {
                handleLayout(LayoutDirection.Vertical)
              }
            "
          >
            <Icon :name="IconName.Vertical" />
          </button>
          <button
            title="水平排列"
            @click="
              () => {
                handleLayout(LayoutDirection.Horizontal)
              }
            "
          >
            <Icon :name="IconName.Horizontal" />
          </button>
        </div>
      </template>
      <!-- 左上角插槽放dashboard显示小组的互动等 -->
      <template #top-left>
        <mini-dash-board
          @checkDetail="onCheckDetail"
          :list="alertList"
          :title="progressText"
        />
      </template>
    </flow-component>
  </div>

  <!-- 学习仪表盘dialog -->
  <el-dialog
    v-model="dashBoardVisible"
    width="1200px"
    height="80vh"
    :append-to-body="true"
  >
    <fullScreenDashBoard
      :dashBoardRenderList="dashBoardRenderList"
      :alerts="alertList"
      :time-line-list="timeLineList"
    />
  </el-dialog>
</template>

<style scoped lang="scss">
.vue-flow-container {
  width: 100%;
  height: 100vh;
  box-sizing: border-box;
  //border-left: 10px solid #615EFC ;
}

.dialog-container {
  width: 100%;
  height: 100%;
}

:deep(.el-dialog) {
  //border-radius: 10px;
  //padding: 10px;
  padding: 0;

  .el-input__wrapper.is-focus,
  .el-textarea {
    --el-input-focus-border-color: var(--theme-color);
    //box-shadow: 0 0 0 1px #2563eb;
  }
}

:deep(.el-dialog__header) {
  padding: 0;
}

:deep(.el-card) {
  border-radius: 10px;
}

h1 {
  font-weight: 500;
  font-size: 30px;
}

h3 {
  font-weight: 300;
  font-size: 18px;
}

.process-panel {
  background-color: #2d3748;
  padding: 10px;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
}

.process-panel button {
  border: none;
  cursor: pointer;
  background-color: #4a5568;
  border-radius: 8px;
  color: white;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
}

.process-panel button {
  font-size: 16px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.checkbox-panel {
  display: flex;
  align-items: center;
  gap: 10px;
}

.process-panel button:hover,
.layout-panel button:hover {
  background-color: #2563eb;
  transition: background-color 0.2s;
}

.process-panel label {
  color: white;
  font-size: 12px;
}

.stop-btn svg {
  display: none;
}

.stop-btn:hover svg {
  display: block;
}

.stop-btn:hover .spinner {
  display: none;
}

.spinner {
  border: 3px solid #f3f3f3;
  border-top: 3px solid #2563eb;
  border-radius: 50%;
  width: 10px;
  height: 10px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

:deep(.el-text) {
  font-size: 18px;
}

.argument-flow-container {
  width: 100%;
  height: 500px;
}

.button-footer-container {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  width: 100%;
  height: 50px;
  border-top: 1px solid var(--dark-color);
  &:deep(.el-button:not(.is-plain)) {
    color: #fff;
  }
}
$dashboard-width: 300px;
$dashboard-height: 300px;
.layout-dashboard {
  width: $dashboard-width;
  height: $dashboard-height;
  background-color: #fff;
}
</style>
