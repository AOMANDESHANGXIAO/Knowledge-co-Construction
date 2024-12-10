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
import CourseWorkAPI from '@/apis/courseWork'
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
import { BLUE, GREEN, PURPLE, RED, THEME_COLOR, YELLOW } from '@/config.ts'
import ContextMenu from '@imengyu/vue3-context-menu'
import { Edge, Node } from '@/components/vueFlow/type.ts'
import ArgumentEditor from './components/ArgumentEditor/index.vue'
import {
  options,
  getReviseOptions,
} from './components/ArgumentEditor/option.ts'
import ViewPointAPI from '@/apis/viewpoint/index.ts'
// import { GetViewPointListResponse } from '@/apis/viewpoint/interface.ts'
import {
  GetTopicResponse,
  CreateNodeResponse,
  NotResponsed,
} from '../../apis/viewpoint/interface'
import {
  GetInteractionResponse,
  InteractionNodeType,
} from '../../apis/viewpoint/interface'
import { useNotification } from 'naive-ui'

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
const queryGroupFilesParams = ref({
  topic_id: topicId.value,
  group_id: getOneUserInfo('group_id'),
  keyword: '',
})
const { getData: getGroupFileData } = useTable<
  typeof queryGroupFilesParams.value,
  FileListItem
>({
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
// const { run: uploadCommunisticFilesApi } = useRequest({
//   apiFn: async () => {
//     const fileList = uploadCommunisticFieldRef.value?.getFileList() as FileList
//     return uploadFilesApi(
//       {
//         topic_id: topicId.value,
//         is_public: 1,
//         student_id: +studentId,
//       },
//       fileList
//     )
//   },
//   onSuccess() {
//     ElNotification({
//       title: 'Success',
//       message: '上传成功',
//       type: 'success',
//       position: 'bottom-right',
//     })
//     clearCommunisticField()
//     getCommunisticFileData()
//   },
//   onFail() {
//     ElNotification({
//       title: 'Error',
//       message: '上传失败',
//       type: 'error',
//       position: 'bottom-right',
//     })
//   },
//   onError() {
//     ElNotification({
//       title: 'Error',
//       message: '上传失败',
//       type: 'error',
//       position: 'bottom-right',
//     })
//   },
// })
/**
 * 交作业模块
 */
// const isFinished = ref<boolean>(false)
// const { run: queryCourseWorkUpload } = useRequest({
//   apiFn: async () => {
//     return CourseWorkAPI.findCourseWorkUpload({
//       topic_id: topicId.value,
//       student_id: +studentId,
//     })
//   },
//   onSuccess(res: any) {
//     isFinished.value = Object.keys(res).length !== 0
//   },
// })
// // 查询是否提交了作业
// const courseWorkContent = ref('')
// const { run: getTopicCourseWork } = useRequest({
//   apiFn: async () => {
//     return CourseWorkAPI.findOne(topicId.value)
//   },
//   onSuccess(res: { courseWork: string | null }) {
//     if (res.courseWork === null) {
//       courseWorkContent.value = ''
//     } else {
//       courseWorkContent.value = res.courseWork
//     }
//     console.log('courseWorkContent', courseWorkContent.value)
//   },
// })
// const courseWorkUploadFiledRef = ref<InstanceType<typeof UploadField> | null>(
//   null
// )
// const { run: uploadCourseWork } = useRequest({
//   apiFn: async () => {
//     const fileList = courseWorkUploadFiledRef.value?.getFileList() as FileList
//     const file = fileList[0]
//     return uploadCourseWorkApi(
//       {
//         topic_id: topicId.value,
//         student_id: +studentId,
//       },
//       file
//     )
//   },
//   onSuccess() {
//     ElNotification({
//       title: 'Success',
//       message: '上传成功',
//       type: 'success',
//       position: 'bottom-right',
//     })
//     courseWorkUploadFiledRef.value?.clearFileList()
//     // getTopicCourseWork()
//   },
//   onFail() {
//     ElNotification({
//       title: 'Error',
//       message: '上传失败',
//       type: 'error',
//       position: 'bottom-right',
//     })
//   },
//   onError() {
//     ElNotification({
//       title: 'Error',
//       message: '上传失败',
//       type: 'error',
//       position: 'bottom-right',
//     })
//   },
// })
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

// 进行防抖，多次触发只更新一次

const questionDialogVisible = ref(false)
const questionIdeaNodes = ref<NodeType[]>([])
let replyNodeId = 0
// 提问的Dialog打开
const questionFormModel = ref({
  question: '',
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
const { run: createNewQuestionApi } = useRequest({
  apiFn: () => {
    const args = getQuestionArgs()
    return questionIdea(args)
  },
})
const questionFormRef = ref<InstanceType<typeof NForm> | null>(null)
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

// const onClickQuestionNode = async (payload: {
//   nodeId: number
//   studentId: number
// }) => {
//   checkQuestionNodeId.value = payload.nodeId
//   // 拿到nodes和edges
//   const res = vueFlowRef.value!.getState()
//   // 查找这个问题指向的观点是什么?
//   const node = flowTool.findTargetNodeBySourceId({
//     nodes: res.nodes,
//     edges: res.edges,
//     node_id: String(payload.nodeId),
//   })
//   targetNodeId = node!.id
//   openCheckQuestionDialog()
//   getReponseContentApi()
//   checkQuestionApi()
// }
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
const closeCheckQuestionDialog = () => {
  checkQuestionVisible.value = false
}

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
const filterMap: Record<
  'support' | 'oppose' | 'ask',
  (item: NodeInteraction) => boolean
> = {
  support: (item: NodeInteraction) => item.type === 'approve',
  oppose: (item: NodeInteraction) => item.type === 'reject',
  ask: (item: NodeInteraction) => item.type === 'question_to_idea',
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
const closeModal = () => (showModal.value = false)
const openModal = () => (showModal.value = true)
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
      setEditorType('idea')
      resetOptions()
      mode.value = 'post'
      showContentList.value = false
      openModal()
      refreshArgumentEditor()
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

const editorType = ref<InteractionNodeType>('idea')
const setEditorType = (type: InteractionNodeType) => {
  editorType.value = type
}
const contentList = ref<GetInteractionResponse['list']>([])
const showContentList = ref(true)
const target = ref('')
const mode = ref<'post' | 'patch'>('post')
const { key, refresh: refreshArgumentEditor } = useRefresh()
const resetOptions = () => {
  options[editorType.value].inputValues.forEach(item => {
    item.value = ''
  })
}
const setInputValues = (contentList: GetInteractionResponse['list']) => {
  options[editorType.value].inputValues.forEach(item => {
    const target = contentList.find(content => content.key === item.key)
    if (target) {
      item.value = target.value
    }
  })
}
const onClickInteractionButton = (payload: {
  target: string
  contentList: GetInteractionResponse['list']
  action: InteractionNodeType
  mode: 'post' | 'patch'
}) => {
  setEditorType(payload.action)
  // resetOptions()
  target.value = payload.target
  showContentList.value = true
  contentList.value = payload.contentList
  mode.value = payload.mode
  if (payload.mode === 'post') {
    resetOptions()
  } else {
    // console.log('payload.contentList', payload.contentList)
    setInputValues(payload.contentList)
  }
  openModal()
  refreshArgumentEditor()
}
const topic = ref('')
useRequest({
  apiFn: async () => {
    return ViewPointAPI.getTopic({
      topic_id: topicId.value,
    })
  },
  onSuccess(data: GetTopicResponse) {
    topic.value = data.content
  },
  immediate: true,
})
const okLoading = ref(false)
const argumentEditorOptions = computed(() => {
  const state =
    mode.value === 'post'
      ? options[editorType.value]
      : getReviseOptions(
          editorType.value,
          options[editorType.value].inputValues
        )

  return {
    ...state,
    contentList: contentList.value,
    showContentList: showContentList.value,
    textFormatContent: topic.value,
    okLoading: okLoading.value,
  }
})
const notification = useNotification()
type inputValues = { key: string; value: string; required: boolean }[]
const okValidator = (list: inputValues) => {
  return list.filter(item => item.required).every(item => item.value)
}
const getRequestAPI = (mode: 'post' | 'patch') => {
  switch (editorType.value) {
    case 'idea': {
      return mode === 'post' ? ViewPointAPI.createIdea : ViewPointAPI.updateIdea
    }
    case 'agree': {
      return mode === 'post'
        ? ViewPointAPI.createAgree
        : ViewPointAPI.updateAgree
    }
    case 'disagree': {
      return mode === 'post'
        ? ViewPointAPI.createDisAgree
        : ViewPointAPI.updateDisAgree
    }
    case 'ask': {
      return mode === 'post' ? ViewPointAPI.createAsk : ViewPointAPI.updateAsk
    }
    case 'response': {
      return mode === 'post'
        ? ViewPointAPI.createResponse
        : ViewPointAPI.updateResponse
    }
    default:
      throw new Error('Invalid editor type')
  }
}
const centerNodeId = ref('')
const onMountedVueFlow = () => {
  setTimeout(() => {
    centerNodeId.value = ''
  }, 1000)
}
const { key: vueFlowKey, refresh: vueFlowRefresh } = useRefresh()
const onOK = (inputValues: inputValues) => {
  if (!okValidator(inputValues)) {
    notification.warning({
      content: '请先填写必填项哦~',
      meta: '提示',
      duration: 2500,
      keepAliveOnHover: true,
    })
  }
  const api = getRequestAPI(mode.value)
  const params: {
    topic_id: string | number
    target: string
    [key: string]: string | number
  } = {
    topic_id: topicId.value,
    target: target.value,
    id: target.value,
    student_id: studentId,
  }
  inputValues.forEach(item => {
    params[item.key] = item.value
  })
  useRequest({
    apiFn: async () => {
      okLoading.value = true
      // @ts-ignore
      return api(params)
    },
    onSuccess(data: CreateNodeResponse) {
      notification.success({
        content: '提交成功!',
        meta: '成功',
        duration: 2500,
        keepAliveOnHover: true,
      })
      closeModal()
      centerNodeId.value = data.id
      vueFlowRefresh()
    },
    onError() {
      notification.error({
        content: '提交失败!',
        meta: '失败',
        duration: 2500,
        keepAliveOnHover: true,
      })
    },
    onFail() {
      notification.error({
        content: '提交失败!',
        meta: '失败',
        duration: 2500,
        keepAliveOnHover: true,
      })
    },
    onFinally() {
      okLoading.value = false
    },
    immediate: true,
  })
  console.log('params', params)
  // console.log('onOK ===> inputValues', inputValues)
}
/**
//  * 处理消息提示
 */
const notResponsedlist = ref<NotResponsed[]>([])
const activeTabKey = ref<'agree' | 'disagree' | 'ask' | 'response'>('agree')
const onTabBarChange = (key: string) => {
  activeTabKey.value = key as 'agree' | 'disagree' | 'ask' | 'response'
}
const getNotResponsedList = (payload: { notResponsed: NotResponsed[] }) => {
  console.log('payload', payload.notResponsed)
  notResponsedlist.value = payload.notResponsed
}
const tabBarList = computed<
  { content: string; key: string; num: number; color: string }[]
>(() => {
  return [
    {
      content: '支持',
      key: 'agree',
      num: notResponsedlist.value.filter(item => item.type === 'agree').length,
      color: GREEN,
    },
    {
      content: '反对',
      key: 'disagree',
      num: notResponsedlist.value.filter(item => item.type === 'disagree')
        .length,
      color: RED,
    },
    {
      content: '困惑',
      key: 'ask',
      num: notResponsedlist.value.filter(item => item.type === 'ask').length,
      color: YELLOW,
    },
    {
      content: '解释',
      key: 'response',
      num: notResponsedlist.value.filter(item => item.type === 'response')
        .length,
      color: PURPLE,
    },
  ]
})
const notResponsedColor = computed(() => {
  switch (activeTabKey.value) {
    case 'agree':
      return GREEN
    case 'disagree':
      return RED
    case 'ask':
      return YELLOW
    case 'response':
      return PURPLE
    default:
      return BLUE
  }
})
const ideaPool = computed(() => {
  return notResponsedlist.value
    .filter(item => item.type === activeTabKey.value)
    .map(item => {
      return {
        color: notResponsedColor.value,
        content: item.name,
        id: item.id,
      }
    })
})
</script>

<template>
  <n-modal-provider>
    <!-- 知识建构图谱 -->
    <div class="vue-flow-container" @click.right.stop="onRightClick">
      <flowComponent
        :key="vueFlowKey"
        :center-id="centerNodeId"
        ref="vueFlowRef"
        :update-vue-flow-effects="() => {}"
        :onMountedEffect="onMountedVueFlow"
        :onUpdateValues="getNotResponsedList"
        @onClickGroupNode="onClickGroupNode"
        @onClickInteractionButton="onClickInteractionButton"
      >
        <!-- 右上角插槽放一些控制按钮 -->
        <template #top-right>
          <div class="layout-panel">
            <n-popover trigger="click" style="padding: 0">
              <template #trigger>
                <button title="消息提示" @click="" style="position: relative">
                  <Icon :name="IconName.Notice"></Icon>
                  <div
                    class="notification-badge"
                    v-if="notResponsedlist.length"
                  >
                    {{ notResponsedlist.length }}
                  </div>
                </button>
              </template>
              <MsgNotice
                :tab-bar-list="tabBarList"
                v-model:active-key="activeTabKey"
                :idea-list="ideaPool"
                @on-change="onTabBarChange"
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
      <ArgumentEditor
        v-bind="argumentEditorOptions"
        :key="key"
        @close="closeModal"
        @ok="onOK"
      ></ArgumentEditor>
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
