<script setup lang="ts">
import flowComponent from '@/components/vueFlow/index.vue'
import { LayoutDirection } from '@/components/vueFlow/type.ts'
import Icon from '@/components/Icons/HomePageIcon/index.vue'
import { IconName } from '@/components/Icons/HomePageIcon/type.ts'
import argumentFlowComponent from './components/ArgumentFlowComponent/refactor.vue'
import { useUserStore } from '../../store/modules/user/index'
import useQueryParam from '@/hooks/router/useQueryParam'
import useRefresh from '../../hooks/Element/useRefresh'
// import { Status } from './components/ArgumentFlowComponent/type'
import { Role, Action } from './components/ArgumentFlowComponent/type.ts'
import useState from '@/hooks/State/useState.ts'
import useRequest from '@/hooks/Async/useRequest'
import { queryTopicContentApi } from '@/apis/manageTalk'
import { TopicContent } from '@/apis/manageTalk/type'

const { getOneUserInfo } = useUserStore()

const studentId = getOneUserInfo('id') as string

const groupId = getOneUserInfo('group_id') as string

// const {
//   nodes,
//   edges,
//   canReviseIdea,
//   canReviseGroupConclusion,
//   topicContent,
//   key,
//   nodeId,
//   reply,
//   argumentFlowRef,
//   vueFlowRef,
//   visible,
//   sumbitStatus,
//   loading,
//   setVisible,
//   handleIdeaAction,
//   handleSumbit,
//   handleLayout,
//   refreshVueFlow,
//   onArgumentModify,
//   handleSummary,
// } = useMyVueFlow({
//   topic_id: topicId.value,
//   student_id: +studentId,
//   group_id: +groupId,
// })

// /**
//  *
//  * @param payload { id: string; studentId: string } id 为查看节点的id
//  */
// const onCheckIdea = (payload: { nodeId: string; studentId: string }) => {
//   handleIdeaAction('check', payload)
// }

// const onCheckGroup = (payload: {
//   groupId: string
//   nodeId: string
//   groupConclusion: string
// }) => {
//   if (!payload.groupConclusion) {
//     ElNotification({
//       title: '提示',
//       message: '该小组还未总结观点',
//       type: 'warning',
//     })
//     return
//   }
//   handleIdeaAction('checkGroup', payload)
// }

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
const controller = reactive({
  role: Role.Idea,
  action: Action.Check,
  InSelfGroup: false,
  InSelfIdea: false,
})

const setControllerState = (
  role: Role,
  action: Action,
  InSelfGroup?: boolean,
  InSelfIdea?: boolean
) => {
  controller.role = role
  controller.action = action
  InSelfGroup && (controller.InSelfGroup = InSelfGroup)
  InSelfIdea && (controller.InSelfIdea = InSelfIdea)
}

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
  openArgumentEditor()
}

const onClickIdeaNode = (payload: { nodeId: string; studentId: string }) => {
  setRequestParams({ focusNodeId: payload.nodeId })
  const slefStudentId = getOneUserInfo('id') as string
  const isSelfIdea = payload.studentId === String(slefStudentId)
  setControllerState(Role.Idea, Action.Check, false, isSelfIdea)
  openArgumentEditor()
}

const handleClickProposeIdeaBtn = () => {
  const inSelfGroup = false
  const inSelfIdea = true
  // 设置论证图编辑器请求的参数，为空字符串表示不需要查询
  setRequestParams({ focusNodeId: '' })
  setControllerState(Role.Idea, Action.Modify, inSelfGroup, inSelfIdea)
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
</script>

<template>
  <section class="dialog-container" v-show="dialogVisible">
    <el-dialog v-model="dialogVisible" width="1200" :append-to-body="true">
      <div class="argument-flow-container">
        <argumentFlowComponent
          :key="key"
          ref="argumentFlowRef"
          :role="controller.role"
          :action="controller.action"
          :InSelfGroup="controller.InSelfGroup"
          :InSelfIdea="controller.InSelfIdea"
          :focus-node-id="requestParams.focusNodeId"
          :show-feed-back="true"
          :topic-content="topicContent"
          reply="none"
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
          @click="
            () => {
              setdialogVisible(false)
            }
          "
          >{{ '确定' }}</el-button
        >
      </div>
    </el-dialog>
  </section>

  <div class="vue-flow-container">
    <flow-component
      ref="vueFlowRef"
      @onClickGroupNode="onClickGroupNode"
      @onClickIdeaNode="onClickIdeaNode"
    >
      <div class="layout-panel">
        <button title="发表观点" @click="handleClickProposeIdeaBtn">
          <Icon :name="IconName.Idea" />
        </button>
        <button
          title="总结观点"
          @click="
            () => {
              setControllerState(Role.Conclusion, Action.Modify, true)
              openArgumentEditor()
            }
          "
        >
          <Icon :name="IconName.Summary" />
        </button>
        <button title="刷新" @click="">
          <Icon :name="IconName.Refresh" />
        </button>
        <button title="返回首页" @click="">
          <Icon :name="IconName.Home" />
        </button>
        <button title="设置" @click="">
          <Icon :name="IconName.Setting" />
        </button>
        <button title="垂直排列" @click="">
          <Icon :name="IconName.Vertical" />
        </button>
        <button title="水平排列" @click="">
          <Icon :name="IconName.Horizontal" />
        </button>
      </div>
    </flow-component>
  </div>
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
</style>
