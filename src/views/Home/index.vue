<script setup lang="ts">
import flowComponent from '@/components/vueFlow/index.vue'
import { LayoutDirection } from '@/components/vueFlow/type.ts'
import Icon from '@/components/Icons/HomePageIcon/index.vue'
import { IconName } from '@/components/Icons/HomePageIcon/type.ts'
import argumentFlowComponent from './components/ArgumentFlowComponent/refactor.vue'
import { useUserStore } from '@/store/modules/user'
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
import fullScreenDashBoard from './components/DashBoardFullScreen/index.vue'
import type { ComposeOption } from 'echarts/core'
import type {
  // 系列类型的定义后缀都为 SeriesOption
  BarSeriesOption,
  RadarSeriesOption,
  GraphSeriesOption,
} from 'echarts/charts'
import {
  queryDashBoard,
  queryWordCloudApi,
  QueryWordCloudResult,
} from '@/apis/flow'
import {
  NodeInteraction,
  QueryDashBoardResponse,
  TimeLineItem,
} from '@/apis/flow/type'
import useEvaluation from './hooks/useEvaluation'
import _ from 'lodash'
import router from '@/router/index.ts'
import { NButton, NForm } from 'naive-ui'
import { uploadFilesApi, uploadCourseWorkApi } from '@/apis/upload/index.ts'
import useTable from '@/hooks/Async/useTable.ts'
import UploadField from '@/components/UploadField/index.vue'
import { downloadFileApi } from '@/apis/files/index.ts'
import CourseWorkAPI from '@/apis/courseWork'
import ChatGptComponent from './components/ChatGptComponent/index.vue'
import type { Scaffold } from './components/ChatGptComponent/chatgptComponent.type'
import { ArgumentType } from './components/ArgumentFlowComponent/type.ts'
import { getArgumentList } from '@/utils/formatter/argument.formatter.ts'
import {
  queryNodeContentApi,
  questionIdea,
  checkQuestionContent,
} from '@/apis/flow'
import flowTool from './useFlowHandler.ts'
import { ArgumentNode, ArgumentEdge } from '@/apis/flow/type.ts'
import { QueryNodeContentData } from '@/apis/flow/type'
import { convertToHTML } from './components/ArgumentFlowComponent/utils.ts'
import MsgNotice from './components/messageNotice/index.vue'
import { THEME_COLOR } from '@/config.ts'
import ContextMenu from '@imengyu/vue3-context-menu'
import { Edge, Node } from '@/components/vueFlow/type.ts'
import ArgumentEditor from './components/ArgumentEditor/index.vue'

const { getOneUserInfo } = useUserStore()

const [dialogVisible, setDialogVisible] = useState(false)

const { refresh } = useRefresh()

/**
 * 这个方法用来打开论证图编辑器
 * 1. 首先可视化dialog
 * 2. 直接更新组件
 */
const openArgumentEditor = () => {
  setDialogVisible(true)
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
  | 'checkIdea'
  | 'checkConclusion'
  | 'modifyIdea'
  | 'modifyConclusion'
  | 'replyIdea'
  | 'proposeIdea'
  | 'proposeConclusion'
  | 'responseQuestion'
>('checkIdea')

const onClickGroupNode = (payload: {
  groupId: string
  nodeId: string
  groupConclusion: string
}) => {
  setRequestParams({ focusNodeId: payload.nodeId })
  // 打开论证图编辑器
  // 判断是否在本组
  const selfGroupId = getOneUserInfo('group_id') as string
  const isSelfGroup = payload.groupId === String(selfGroupId)
  setControllerState(Role.Conclusion, Action.Check, isSelfGroup, false)
  setCondition('checkConclusion') // 点击小组节点时，论证图编辑器渲染为查看小组结论
  openArgumentEditor()
}

const onClickIdeaNode = (payload: { nodeId: string; studentId: string }) => {
  setRequestParams({ focusNodeId: payload.nodeId })
  const selfStudentId = getOneUserInfo('id') as string
  const isSelfIdea = payload.studentId === String(selfStudentId)
  setControllerState(Role.Idea, Action.Check, false, isSelfIdea)
  setCondition('checkIdea') // 点击观点节点时，论证图编辑器渲染为查看观点
  console.log('click idea node', payload)
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

  return nodes.find(node => {
    if (node.type !== 'group') return false
    const data = node.data as GroupNodeProps
    if (String(data.group_id) === String(group_id)) return true
  })
}

const handleClickConclusionBtn = () => {
  // 做一个判断，如果没有groupConclusion，则状态为提出小组结论
  // @ts-ignore
  const groupNode = getGroupNode()
  // console.log('groupNode', groupNode)
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

/**
 * 记录修改的观点
 */
const modifiedNodes: NodeType[] = []
const modifiedEdges: EdgeType[] = []

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
  submitResponseQuestion,
} = useSubmit({
  onSuccess: () => {
    ElNotification({
      title: 'Success',
      message: '提交成功',
      type: 'success',
      position: 'bottom-right',
    })
    setDialogVisible(false)
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

const handleSubmit = () => {
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
      // console.log('修改小组结论')
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
    case 'responseQuestion': {
      console.log('responseQuestion submitting...')
      console.log('nodes', nodesValue)
      console.log('edges', edgesValue)
      submitResponseQuestion({
        topic_id: topicId.value,
        student_id: +studentId,
        nodes: nodesValue,
        edges: edgesValue,
        questionNodeId: String(checkQuestionNodeId.value),
      })
      console.log('submitResponseQuestion finished')
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
  highLightPatterns,
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
// 词云图查询
const cloudWordData = ref<QueryWordCloudResult['list']>([])
const { run: getCloudWordData } = useRequest({
  apiFn: async () => {
    return queryWordCloudApi({ topic_id: topicId.value })
  },
  onSuccess(data) {
    cloudWordData.value = data.list
  },
})
provide('getCloudWordData', getCloudWordData)

// 处理文件
const [fileDialogVisible, setFileDialogVisible] = useState(false)
type FileListItem = {
  filename: string
  file_path: string
  upload_time: string
  nickname: string
}
const formatDate = (timeString: string) => {
  const date = new Date(timeString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0') // 月份从0开始，所以要加1
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}
const queryGroupFilesParams = ref({
  topic_id: topicId.value,
  group_id: getOneUserInfo('group_id'),
  keyword: '',
})
const {
  data: groupFileData,
  getData: getGroupFileData,
  sort: groupFileSort,
} = useTable<typeof queryGroupFilesParams.value, FileListItem>({
  url: '/files/group',
  queryParams: queryGroupFilesParams,
  immediate: true,
  defaultSort: 'DESC',
  throttle: 100,
  onSuccess() {
    ElMessage({
      message: '查询成功',
      type: 'success',
    })
  },
  onError() {
    ElMessage({
      message: '查询失败',
      type: 'error',
    })
  },
  onFailure() {
    ElMessage({
      message: '查询失败',
      type: 'error',
    })
  },
})

// const handleClickGroupFileBtn = () => {
//   setFileDialogVisible(true)
// }
const uploadGroupFieldRef = ref<InstanceType<typeof UploadField> | null>(null)
const { run: uploadFileRequest } = useRequest({
  apiFn: async () => {
    const uploadInput = {
      student_id: +studentId,
      topic_id: topicId.value,
      is_public: isPrivate.value ? 0 : 1,
    }
    // mod here
    // 使用组件来替代
    const fileList = uploadGroupFieldRef.value!.getFileList() as FileList
    return uploadFilesApi(uploadInput, fileList)
  },
  onSuccess() {
    ElNotification({
      title: 'Success',
      message: '上传成功',
      type: 'success',
      position: 'bottom-right',
    })
    // 清空已上传的文件
    uploadGroupFieldRef.value!.clearFileList()
    // 成功上传后更新列表
    getGroupFileData()
  },
  onError() {
    ElNotification({
      title: 'Error',
      message: '上传失败',
      type: 'error',
      position: 'bottom-right',
    })
  },
  onFail() {
    ElNotification({
      title: 'Error',
      message: '上传失败',
      type: 'error',
      position: 'bottom-right',
    })
  },
})
const isPrivate = ref<boolean>(true)

const queryCommunisticFilesParams = ref({
  topic_id: topicId.value,
  keyword: '',
})
const {
  data: CommunisticFileData,
  getData: getCommunisticFileData,
  sort: CommunisticSort,
} = useTable({
  url: '/files/community',
  queryParams: queryCommunisticFilesParams,
  immediate: false,
  defaultSort: 'DESC',
  throttle: 100,
  onSuccess() {
    ElMessage({
      message: '查询成功',
      type: 'success',
    })
  },
  onFailure() {
    ElMessage({
      message: '查询失败',
      type: 'error',
    })
  },
  onError() {
    ElMessage({
      message: '查询失败',
      type: 'error',
    })
  },
})
const uploadCommunisticFieldRef = ref<InstanceType<typeof UploadField> | null>(
  null
)
const clearCommunisticField = () => {
  uploadCommunisticFieldRef.value?.clearFileList()
}
const { run: uploadCommunisticFilesApi } = useRequest({
  apiFn: async () => {
    const fileList = uploadCommunisticFieldRef.value?.getFileList() as FileList
    return uploadFilesApi(
      {
        topic_id: topicId.value,
        is_public: 1,
        student_id: +studentId,
      },
      fileList
    )
  },
  onSuccess() {
    ElNotification({
      title: 'Success',
      message: '上传成功',
      type: 'success',
      position: 'bottom-right',
    })
    clearCommunisticField()
    getCommunisticFileData()
  },
  onFail() {
    ElNotification({
      title: 'Error',
      message: '上传失败',
      type: 'error',
      position: 'bottom-right',
    })
  },
  onError() {
    ElNotification({
      title: 'Error',
      message: '上传失败',
      type: 'error',
      position: 'bottom-right',
    })
  },
})
/**
 * 交作业模块
 */
const isFinished = ref<boolean>(false)
const { run: queryCourseWorkUpload } = useRequest({
  apiFn: async () => {
    return CourseWorkAPI.findCourseWorkUpload({
      topic_id: topicId.value,
      student_id: +studentId,
    })
  },
  onSuccess(res: any) {
    isFinished.value = Object.keys(res).length !== 0
  },
})
// 查询是否提交了作业
const courseWorkContent = ref('')
const { run: getTopicCourseWork } = useRequest({
  apiFn: async () => {
    return CourseWorkAPI.findOne(topicId.value)
  },
  onSuccess(res: { courseWork: string | null }) {
    if (res.courseWork === null) {
      courseWorkContent.value = ''
    } else {
      courseWorkContent.value = res.courseWork
    }
    console.log('courseWorkContent', courseWorkContent.value)
  },
})
const courseWorkUploadFiledRef = ref<InstanceType<typeof UploadField> | null>(
  null
)
const { run: uploadCourseWork } = useRequest({
  apiFn: async () => {
    const fileList = courseWorkUploadFiledRef.value?.getFileList() as FileList
    const file = fileList[0]
    return uploadCourseWorkApi(
      {
        topic_id: topicId.value,
        student_id: +studentId,
      },
      file
    )
  },
  onSuccess() {
    ElNotification({
      title: 'Success',
      message: '上传成功',
      type: 'success',
      position: 'bottom-right',
    })
    courseWorkUploadFiledRef.value?.clearFileList()
    // getTopicCourseWork()
  },
  onFail() {
    ElNotification({
      title: 'Error',
      message: '上传失败',
      type: 'error',
      position: 'bottom-right',
    })
  },
  onError() {
    ElNotification({
      title: 'Error',
      message: '上传失败',
      type: 'error',
      position: 'bottom-right',
    })
  },
})
const argumentTypeChinese = {
  [ArgumentType.Claim]: '论点',
  [ArgumentType.Data]: '论据',
  [ArgumentType.Warrant]: '辩护',
  [ArgumentType.Rebuttal]: '反驳',
  [ArgumentType.Backing]: '支持',
  [ArgumentType.Qualifier]: '限定词',
}
const getArgumentFlowState = () => {
  const res = argumentFlowRef.value?.getArgumentState()
  console.log('getArgumentFlowState res', res)
  if (!res) {
    return {
      nodes: [],
      edges: [],
    }
  }
  return {
    nodes: res.nodes.value,
    edges: res.edges.value,
  }
}
const getFormattedArgument = () => {
  const { nodes } = getArgumentFlowState()
  return nodes
    .map(node => {
      return `${argumentTypeChinese[node._type]}: ${node.data.inputValue}`
    })
    .join('\n')
}
/**
 * 检查props.nodes和props.edges的情况，只有nodes和edges中包含
 * 前提、结论、辩护时才可以发送消息
 */
const checkNodesAndEdges = (
  conditions: {
    nodeType: NodeType['_type']
    minWordCount: number
  }[]
) => {
  let count = 0
  const { nodes } = getArgumentFlowState()
  for (const condition of conditions) {
    const findNode = nodes.find(node => node._type === condition.nodeType)
    // console.log('findNode', findNode)
    if (findNode && findNode.data.inputValue.length >= condition.minWordCount) {
      count++
    }
  }
  return count === conditions.length
}
// 要让ChatGpt的Component拿到论证图谱的nodes和edges
const chatGptPromptScofflds: Scaffold[] = [
  {
    title: '给一个论证框架',
    description: '请根据我的话题,给出一个基本的论证',
    key: 'argument',
    getPrompt: () => {
      return `论证话题为: """${topicContent.value}"""。请你基于图尔敏的论证模型给出一个论证。`
    },
    ShowInQuickPrompt: true,
    validate: () => {
      return true
    },
    onValidateError: () => {
      ElMessage.error('请先完整输入论证内容')
    },
  },
  {
    title: '指出不足之处',
    description: '请你帮我分析我的论证有什么不足之处',
    key: 'limitation',
    getPrompt: () => {
      return `我想论证的话题为"""
      ${topicContent.value}
      """"。这是我的论证:"""${getFormattedArgument()}"""。请你指出我的论证的不足之处或者逻辑有问题之处。`
    },
    ShowInQuickPrompt: true,
    validate: () => {
      return checkNodesAndEdges([
        {
          nodeType: ArgumentType.Claim,
          minWordCount: 10,
        },
        {
          nodeType: ArgumentType.Data,
          minWordCount: 10,
        },
      ])
    },
    onValidateError: () => {
      ElNotification({
        title: '提示',
        message: '请先完整输入论证内容,至少填写前提和结论,每个元素至少10个字。',
        type: 'warning',
      })
    },
  },
]

const nodesForChatGpt = ref<NodeType[]>([])
const edgesForChatGpt = ref<EdgeType[]>([])
// 进行防抖，多次触发只更新一次

const questionDialogVisible = ref(false)
const openQuestionDialog = () => {
  questionDialogVisible.value = true
}
const closeQuestionDialog = () => {
  questionDialogVisible.value = false
}
const questionIdeaNodes = ref<NodeType[]>([])
let replyNodeId = 0
// 提问的Dialog打开
const questionFormModel = ref({
  question: '',
})
const questionFormModelRules = {
  question: [{ required: true, message: '请输入问题', trigger: 'change' }],
}
const questionScaffoldList = ref([
  {
    title: '厘清概念与定义',
    list: [
      '你为什么这么说?XXX',
      'XX与我们所讨论的有什么关系?',
      'XX到底是什么意思?',
    ],
  },
  {
    title: '探究假设与前提',
    list: [
      '请解释你为什么XXX',
      '你好像假设了XXX',
      '你怎样证明或者反对该假设?',
      '你同意还是反对XX?',
    ],
  },
  {
    title: '探究理由与证据',
    list: ['这些理由足够充分吗?', '你有什么证据支持?', '你怎么知道这个的?'],
  },
  {
    title: '质疑观点与视角',
    list: [
      '另一种看待此问题的方式是XXX,这听起来有道理吗?',
      '其他看待此问题的视角是什么?',
      'XX的优点和缺点是什么?',
    ],
  },
  {
    title: '探究后果与影响',
    list: ['这个会怎么影响XX?', '这个假设的后果是什么?', '为什么XXX是重要的?'],
  },
  {
    title: '探究问题本身',
    list: ['你提的这个问题有什么意义?', '为什么要论证XX?'],
  },
])
const onClickQuestionTag = (word: string) => {
  questionFormModel.value.question += word
}
const isQuestionargumentList = computed(() => {
  return getArgumentList(questionIdeaNodes.value)
})

const getQuestionArgs = () => {
  const student_id = JSON.parse(localStorage.getItem('userInfo')!).id
  return {
    topic_id: topicId.value,
    question_content: questionFormModel.value.question.trim(),
    student_id: Number(student_id),
    reply_node_id: replyNodeId,
  }
}
// question
const { run: createNewQuestionApi, loading: questionSubmitLoading } =
  useRequest({
    apiFn: () => {
      const args = getQuestionArgs()
      return questionIdea(args)
    },
  })
const questionFormRef = ref<InstanceType<typeof NForm> | null>(null)
const onClickQuestionSubmitBtn = () => {
  console.log('onClickQuestionSubmitBtn')
  console.log(questionFormRef.value)
  if (questionFormModel.value.question.trim().length === 0) {
    ElMessage.error('请输入问题')
    return
  }
  createNewQuestionApi()
}
// 检查questionNode
const getCheckQuestionParams = () => {
  return {
    node_id: checkQuestionNodeId.value,
    student_id: JSON.parse(localStorage.getItem('userInfo')!).id as number,
  }
}
// 显示查看的问题内容
const questionContent = ref({
  content: '',
  nickname: '',
})
const { run: checkQuestionApi } = useRequest({
  apiFn: async () => {
    const args = getCheckQuestionParams()
    return checkQuestionContent(args)
  },
  onSuccess(res: { content: string; nickname: string }) {
    questionContent.value = res
    console.log('checkQuestionApi', res)
  },
})
let checkQuestionNodeId = ref(0)

const onClickQuestionNode = async (payload: {
  nodeId: number
  studentId: number
}) => {
  checkQuestionNodeId.value = payload.nodeId
  // 拿到nodes和edges
  const res = vueFlowRef.value!.getState()
  // 查找这个问题指向的观点是什么?
  const node = flowTool.findTargetNodeBySourceId({
    nodes: res.nodes,
    edges: res.edges,
    node_id: String(payload.nodeId),
  })
  targetNodeId = node!.id
  openCheckQuestionDialog()
  getReponseContentApi()
  checkQuestionApi()
}
/**
 * 查看问题回复的观点
 */
let targetNodeId = ''
const getReponseContentParams = () => {
  return {
    node_id: Number(targetNodeId),
    student_id: Number(studentId),
  }
}
const responseArgumentState = ref<{
  nodes: ArgumentNode[]
  edges: ArgumentEdge[]
}>({
  nodes: [],
  edges: [],
})
const responseArgumentHTML = computed(() => {
  return convertToHTML({
    nodes: responseArgumentState.value.nodes,
    edges: responseArgumentState.value.edges,
  })
})
const { run: getReponseContentApi } = useRequest({
  apiFn: () => {
    const params = getReponseContentParams()
    return queryNodeContentApi(params.node_id, params.student_id)
  },
  onSuccess: (res: QueryNodeContentData) => {
    const { nodes, edges } = res
    console.log('getReponseContentApi success', res)
    responseArgumentState.value.nodes = nodes
    responseArgumentState.value.edges = edges
  },
})

const checkQuestionVisible = ref(false)
const openCheckQuestionDialog = () => {
  checkQuestionVisible.value = true
}
const closeCheckQuestionDialog = () => {
  checkQuestionVisible.value = false
}
const onClickResponseQuestion = () => {
  closeCheckQuestionDialog()
  setCondition('responseQuestion')
  openArgumentEditor()
  console.log('onClickReponseQuestion')
}
/**
 * 消息提示功能
 */
const handleClickNotice = () => {}

const activeKey = ref<'support' | 'ask' | 'oppose'>('support')
interface Idea {
  nickname: string
  content: string
  type: 'primary' | 'info' | 'warning' | 'success' | 'error'
  id: string
}
const relatedValue = ref<NodeInteraction[]>([])
/**
 * 这个方法提醒学习者去交互
 */
const notifactionStudentToInteract = ({
  support,
  ask,
  oppose,
}: {
  support: number
  ask: number
  oppose: number
}) => {
  const supportMessage =
    support > 0
      ? `<div>有<strong><span style="color:green">${support}</span></strong>个学生支持你的意见</div>`
      : ''
  const askMessage =
    ask > 0
      ? `<div>有<strong><span style="color:blue">${ask}</span></strong>个学生提出了问题</div>`
      : ''
  const opposeMessage =
    oppose > 0
      ? `<div>有<strong><span style="color:red">${oppose}</span></strong>个学生反对你的意见</div>`
      : ''
  const callToActionMessage = `<div>请及时回应和参与讨论</div>`
  return
  ElNotification({
    title: '提示',
    type: 'success',
    dangerouslyUseHTMLString: true,
    message: `
<div style="font-size:20px">
    ${supportMessage}
    ${askMessage}
    ${opposeMessage}
    ${callToActionMessage}
</div>`,
    position: 'bottom-right',
    duration: 0,
  })
}
const onFlowComponentValueUpdate = ({
  related,
}: {
  nodes: Node[]
  edges: Edge[]
  related: NodeInteraction[]
}) => {
  relatedValue.value = [...related]
  if (relatedValue.value.length === 0) return
  notifactionStudentToInteract({
    support: related.filter(item => item.type === 'approve').length,
    ask: related.filter(item => item.type === 'question_to_idea').length,
    oppose: related.filter(item => item.type === 'reject').length,
  })
  console.log('onFlowComponentValueUpdate.related', related)
}
const filterMap: Record<
  'support' | 'oppose' | 'ask',
  (item: NodeInteraction) => boolean
> = {
  support: (item: NodeInteraction) => item.type === 'approve',
  oppose: (item: NodeInteraction) => item.type === 'reject',
  ask: (item: NodeInteraction) => item.type === 'question_to_idea',
}
const allNotResponsed = computed(() => {
  return relatedValue.value.filter(item => !item.responsed)
})
const ideaList = computed<Idea[]>(() => {
  const filterFunc = filterMap[activeKey.value]
  let type: Idea['type'] = 'info'
  if (activeKey.value === 'ask') {
    type = 'info'
  } else if (activeKey.value === 'support') {
    type = 'success'
  } else {
    type = 'error'
  }
  return relatedValue.value
    .filter(item => !item.responsed)
    .filter(item => {
      return filterFunc(item)
    })
    .map(item => {
      return {
        nickname: item.sourceNodeStudent,
        type,
        id: item.source,
        content: item.sourceNodeContent,
      }
    })
})
const msgTabBarList = computed(() => {
  return [
    {
      content: '支持我的',
      key: 'support',
      num: relatedValue.value.filter(item => item.type === 'approve').length,
    },
    {
      content: '反对我的',
      key: 'oppose',
      num: relatedValue.value.filter(item => item.type === 'reject').length,
    },
    {
      content: '向我提问的',
      key: 'ask',
      num: relatedValue.value.filter(item => item.type === 'question_to_idea')
        .length,
    },
  ]
})
const onTagChange = (key: string) => {
  console.log('key', key)
  activeKey.value = key as 'support' | 'ask' | 'oppose'
}
const onClickTag = (id: string) => {
  console.log('id', id)
  vueFlowRef.value?.setFitViewOnNodeCenter(id)
}
const responseEdges = ref<{
  approve: EdgeType[]
  reject: EdgeType[]
  question: EdgeType[]
}>({
  approve: [],
  reject: [],
  question: [],
})
const getResponseNodesValue = () => {
  const res = flowTool.getResponseNodes({
    nodes: vueFlowRef.value!.getState().nodes,
    edges: vueFlowRef.value!.getState().edges,
    student_id: studentId,
  })
  responseEdges.value = res
}

const onRightClick = (e: MouseEvent) => {
  //prevent the browser's default menu
  e.preventDefault()
  //show your menu
  ContextMenu.showContextMenu({
    x: e.x,
    y: e.y,
    items: buttons.value.map(btn => {
      return {
        label: btn.title,
        onClick: () => btn.action(),
      }
    }),
  })
}

/**
 * 论点编辑器模块
 */
const showModal = ref(false)
const buttons = ref<
  Array<{
    title: string
    icon: IconName
    action: (...args: any) => void
  }>
>([
  // { title: '小组文件', icon: IconName.File, action: handleClickGroupFileBtn },
  {
    title: '发表观点',
    icon: IconName.Idea,
    action: () => {
      showModal.value = true
    },
  },
  {
    title: '总结观点',
    icon: IconName.Summary,
    action: handleClickConclusionBtn,
  },
  { title: '刷新界面', icon: IconName.Refresh, action: handleRereshFlowData },
  {
    title: '垂直排列',
    icon: IconName.Vertical,
    action: () => handleLayout(LayoutDirection.Vertical),
  },
  {
    title: '水平排列',
    icon: IconName.Horizontal,
    action: () => handleLayout(LayoutDirection.Horizontal),
  },
  {
    title: '返回首页',
    icon: IconName.Home,
    action: () => router.push({ path: '/' }),
  },
])
const argumentEditorOptions = ref({
  title: '编辑器',
  inputValues: [
    {
      title:'结论',
      value:'',
      placeholder:'你的主要观点是什么?',
      tags: ['词条1','词条2']
    },
    {
      title:'理由',
      value:'',
      placeholder:'你这么说有什么道理?',
      tags: ['词条1','词条2']
    },
    {
      title:'局限性',
      value:'',
      placeholder:'你这么说有什么局限性?',
      tags: ['词条1','词条2']
    }
  ],
  arrow:{
    text: '提交',
    color: THEME_COLOR,
  },
  prompt: 'What Your reply',
})
</script>

<template>
  <n-modal-provider>
    <!-- 知识建构图谱 -->
    <div class="vue-flow-container" @click.right.stop="onRightClick">
      <flowComponent
        ref="vueFlowRef"
        :update-vue-flow-effects="
          () => {
            getDashBoardData()
            getResponseNodesValue()
          }
        "
        :onUpdateValues="onFlowComponentValueUpdate"
        @onClickGroupNode="onClickGroupNode"
        @onClickIdeaNode="onClickIdeaNode"
        @onClickQuestionNode="onClickQuestionNode"
      >
        <!-- 右上角插槽放一些控制按钮 -->
        <template #top-right>
          <div class="layout-panel">
            <n-popover trigger="click" style="padding: 0">
              <template #trigger>
                <button
                  title="消息提示"
                  @click="handleClickNotice"
                  style="position: relative"
                >
                  <Icon :name="IconName.Notice"></Icon>
                  <div
                    class="notification-badge"
                    v-if="allNotResponsed.length > 0"
                  >
                    {{ allNotResponsed.length }}
                  </div>
                </button>
              </template>
              <MsgNotice
                :tab-bar-list="msgTabBarList"
                v-model:active-key="activeKey"
                :idea-list="ideaList"
                @on-change="onTagChange"
                @on-click-tag="onClickTag"
              ></MsgNotice>
            </n-popover>
            <button
              v-for="(button, index) in buttons"
              :key="index"
              :title="button.title"
              @click="button.action"
            >
              <Icon :name="button.icon" />
            </button>
          </div>
        </template>
        <!-- 左上角插槽放dashboard显示小组的互动等 -->
        <template #top-left> </template>
      </flowComponent>
    </div>

    <!-- 论点编辑器dialog -->
    <n-modal v-model:show="showModal">
      <ArgumentEditor v-bind="argumentEditorOptions"></ArgumentEditor>
    </n-modal>

    <!-- 学习仪表盘dialog -->
    <el-dialog
      v-model="dashBoardVisible"
      width="1200px"
      height="80vh"
      :append-to-body="true"
    >
      <fullScreenDashBoard
        :patterns="highLightPatterns"
        :dashBoardRenderList="dashBoardRenderList"
        :alerts="alertList"
        :time-line-list="timeLineList"
        :word-cloud-text-list="cloudWordData"
      />
    </el-dialog>

    <!-- 提问Dialog -->
    <el-dialog
      v-model="questionDialogVisible"
      width="80%"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <n-row :gutter="20">
        <n-col :span="12">
          <n-form
            ref="questionFormRef"
            :model="questionFormModel"
            :rules="questionFormModelRules"
          >
            <n-form-item path="question" label="问题">
              <n-input
                v-model:value="questionFormModel.question"
                type="textarea"
                placeholder="请输入想提的问题..."
              >
              </n-input>
            </n-form-item>
          </n-form>
          <!-- 提示正在提问的观点 -->
          <div class="notice-is-reply-container">
            <n-text type="primary" style="font-size: 20px"
              >正在提问的观点</n-text
            >
            <div>
              <div v-for="(item, index) in isQuestionargumentList" :key="index">
                <n-text type="info"> {{ item.type + ':' }}</n-text>
                <n-text>{{ item.text }}</n-text>
              </div>
            </div>
          </div>
        </n-col>
        <n-col :span="12">
          <n-collapse>
            <n-collapse-item
              v-for="(item, index) in questionScaffoldList"
              :title="item.title"
              :name="item.title"
              :key="index"
            >
              <div class="tags-content">
                <n-tag
                  v-for="(word, _index) in item.list"
                  :key="_index"
                  type="primary"
                  @click="onClickQuestionTag(word)"
                  >{{ word }}</n-tag
                >
              </div>
            </n-collapse-item>
          </n-collapse>
        </n-col>
      </n-row>

      <template #footer>
        <div class="dialog-footer">
          <n-button @click="closeQuestionDialog">取 消</n-button>
          <n-button
            type="primary"
            :loading="questionSubmitLoading"
            @click="onClickQuestionSubmitBtn"
            style="margin-left: 10px"
            >确 认</n-button
          >
        </div>
      </template>
    </el-dialog>

    <!-- check question dialog -->
    <el-dialog
      v-model="checkQuestionVisible"
      :append-to-body="true"
      width="80%"
    >
      <div class="check-question-dialog">
        <div style="font-size: 24px">
          <strong
            ><n-text type="primary">{{
              questionContent.nickname + '的提问' || '正在加载...'
            }}</n-text></strong
          >
        </div>
        <div>
          <n-text>{{ questionContent.content || '正在加载...' }}</n-text>
        </div>
      </div>
      <div class="response-idea-container" style="margin-top: 20px">
        <div style="font-size: 24px">
          <strong
            ><n-text type="primary">该问题针对以下论点提问</n-text></strong
          >
        </div>
        <div v-html="responseArgumentHTML || '正在加载...'"></div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <n-button @click="closeCheckQuestionDialog">取 消</n-button>
          <n-button
            type="primary"
            @click="onClickResponseQuestion"
            style="margin-left: 10px"
            >回 应</n-button
          >
        </div>
      </template>
    </el-dialog>
  </n-modal-provider>
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
.chatgpt-container {
  width: 100%;
  height: 100%;
  background-color: pink;
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
  background-color: v-bind(THEME_COLOR);
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

.upload-list {
  li {
    list-style: none;
  }
}
.notification-badge {
  position: absolute;
  z-index: 10;
  right: -2px;
  bottom: -8px;
  width: 20px;
  height: 20px;
  background-color: red;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  animation: shake 2.5s infinite;
}
/* 定义摇晃动画 */
@keyframes shake {
  75% {
    transform: translate(0);
  }
  80% {
    transform: translate(-2px);
  }
  85% {
    transform: translate(2px);
  }
  90% {
    transform: translate(-2px);
  }
  100% {
    transform: translate(0);
  }
}
.search-box {
  display: flex;
  align-items: center;
  //justify-content: flex-end;
  gap: 10px;
  border-top: 1px solid #ccc;
  padding-top: 10px;
  margin-top: 10px;
}

$naive-green: #18a058;
:deep(.el-select__wrapper.is-focused) {
  box-shadow: 0 0 0 1px $naive-green inset !important;
}

:deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px $naive-green inset !important;
}

.work-content-box {
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 10px;
  margin-bottom: 10px;
}

.tags-content {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  :deep(.n-tag) {
    cursor: pointer;
  }
}
</style>
