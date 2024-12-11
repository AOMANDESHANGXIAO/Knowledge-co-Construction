<script setup lang="ts">
import flowComponent from '@/components/vueFlow/index.vue'
import { LayoutDirection } from '@/components/vueFlow/type.ts'
import Icon from '@/components/Icons/HomePageIcon/index.vue'
import { IconName } from '@/components/Icons/HomePageIcon/type.ts'
import { useUserStore } from '@/store/modules/user'
import useQueryParam from '@/hooks/router/useQueryParam'
import useRefresh from '../../hooks/Element/useRefresh'
import useState from '@/hooks/State/useState.ts'
import useRequest from '@/hooks/Async/useRequest'
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
  QueryDashBoardResponse,
  TimeLineItem,
} from '@/apis/flow/type'
import useEvaluation from './hooks/useEvaluation'
import _ from 'lodash'
import router from '@/router/index.ts'
import MsgNotice from './components/messageNotice/index.vue'
import { BLUE, GREEN, PURPLE, RED, THEME_COLOR, YELLOW } from '@/config.ts'
import ContextMenu from '@imengyu/vue3-context-menu'
import ArgumentEditor from './components/ArgumentEditor/index.vue'
import {
  options,
  getReviseOptions,
  getGroupReviseOptions,
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


/**
 * 查询topic话题信息
 */
const topicId = useQueryParam<number>('topic_id')
const vueFlowRef = ref<InstanceType<typeof flowComponent> | null>(null)

/**
 * 请求参数
 */
const studentId = getOneUserInfo('id') as string

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

const onClickTag = (id: string) => {
  console.log('id', id)
  vueFlowRef.value?.setFitViewOnNodeCenter(id)
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
  if (editorType.value !== 'group') {
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
  } else {
    const state =
      mode.value === 'post'
        ? options[editorType.value]
        : getGroupReviseOptions(options[editorType.value].inputValues)
    return {
      ...state,
      contentList: contentList.value,
      showContentList: showContentList.value,
      okLoading: okLoading.value,
      okValidator,
      textFormatContent: topic.value,
    }
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
    case 'group': {
      return mode === 'post'
        ? ViewPointAPI.updateGroup
        : ViewPointAPI.updateGroup
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
/**
 * 处理小组观点的总结
 */
const onClickEditButton = (payload: {
  type: InteractionNodeType
  id: string
  contentList: GetInteractionResponse['list']
  mode: 'post' | 'patch'
}) => {
  if (payload.mode === 'post') {
    mode.value = 'post'
    setEditorType(payload.type)
    target.value = payload.id
    contentList.value = payload.contentList
    showContentList.value = false
    openModal()
    refreshArgumentEditor()
  } else {
    // patch
    mode.value = 'patch'
    setInputValues(payload.contentList)
    setEditorType(payload.type)
    target.value = payload.id
    contentList.value = payload.contentList
    showContentList.value = true
    openModal()
    refreshArgumentEditor()
  }
}
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
        @onClickInteractionButton="onClickInteractionButton"
        @onClickEditButton="onClickEditButton"
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
