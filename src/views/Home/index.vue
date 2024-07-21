<script setup lang="ts">
import { ref } from 'vue'
import flowComponent from '@/components/vueFlow/index.vue'
import { LayoutDirection } from '@/components/vueFlow/type.ts'
import Icon from '@/components/Icons/HomePageIcon/index.vue'
import { useColorStore } from '@/store/modules/color'
import { useRouter } from 'vue-router'
import router from '@/router/index.ts'
import { useUserStore } from '@/store/modules/user'
import {
  proposeIdeaApi,
  replyIdeaApi,
  reviseGroupConclusionApi,
  reviseSelfIdeaApi,
} from '@/apis/flow/index.ts'
import type {
  ProposeIdeaParams,
  ReplyIdeaParams,
  ReviseGroupConclusionParams,
  ReviseSelfIdeaParams,
} from '@/apis/flow/type.ts'
import { IconName } from '@/components/Icons/HomePageIcon/type.ts'
import {
  Action,
  FormListItem,
  ProposeIdeaModelType,
  ApproveIdeaModelType,
  OpposeIdeaModelType,
  SummaryIdeaModelType,
  ReviseSelfFormModelType,
} from './type.ts'
import type { FormRules, FormInstance } from 'element-plus'
import { useCssVar } from '@vueuse/core'
import argumentFlowComponent from './components/ArgumentFlowComponent/index.vue'

const colorStore = useColorStore()

const themeColor = colorStore.themeColor
// 给引用组件标注类型
type vueFlowInstance = InstanceType<typeof flowComponent>

const vueFlowRef = ref<vueFlowInstance | null>(null)

// panel菜单选项方法
const handleLayoutGraph = (direction: LayoutDirection) => {
  vueFlowRef.value?.layoutGraph(direction)
}

const handleGoHome = () => {
  router.push('/manage')
}

const visible = ref<boolean>(false)

const title = ref('')

const replyToId = ref<string>('')

const handleViewIdeaDialog = () => {
  visible.value = !visible.value
}

// ====提出观点逻辑=====
const proposeIdeaFormRef = ref<FormInstance | null>(null)

const proposeIdeaModel = ref<ProposeIdeaModelType>({
  option: '',
  basedOption: '',
  limitation: '',
})

const proposeIdeaFormList = ref<FormListItem[]>([
  {
    title: '🤔你的观点是',
    placeholder: '请输入你的观点',
    model: 'option',
  },
  {
    title: '😲你的依据是',
    placeholder: '请输入你的依据',
    model: 'basedOption',
  },
  {
    title: '😛你的观点的局限在于(选填)',
    placeholder: '请输入你的观点的局限',
    model: 'limitation',
  },
])

const proposeIdeaFormRules: FormRules = reactive({
  option: [
    {
      required: true,
      message: '观点不能为空!',
      trigger: 'blur',
    },
  ],
  basedOption: [
    {
      required: true,
      message: '依据不能为空!',
      trigger: 'blur',
    },
  ],
})

const handleProposeIdea = () => {
  action.value = Action.proposal
  title.value = '提出你的观点!'
  handleViewIdeaDialog()
}

const _router = useRouter()

const userStore = useUserStore()

const proposeIdeaCallBack = () => {
  const content = `观点是:${proposeIdeaModel.value.option}\n依据是:${proposeIdeaModel.value.basedOption}\n局限在于:${proposeIdeaModel.value.limitation}`

  const params: ProposeIdeaParams = {
    topic_id: _router.currentRoute.value.query?.topic_id as unknown as number,
    student_id: userStore.userInfo.id,
    content: content,
  }
  loading.value = true
  proposeIdeaApi(params)
    .then(res => {
      const data: any = res

      if (data.success) {
        ElNotification({
          title: 'Success',
          message: data.message,
          type: 'success',
          position: 'bottom-right',
        })
        vueFlowRef.value?.refresh()
      } else {
        ElNotification({
          title: 'Error',
          message: data.message,
          type: 'error',
          position: 'bottom-right',
        })
      }
      console.log(res)
    })
    .finally(() => {
      handleViewIdeaDialog()
      loading.value = false
    })
}

// 控制按钮加载状态
const loading = ref(false)

const action = ref<Action>(Action.proposal)

const ideaContent = ref<string>('')

// ====================

// =====同意观点逻辑=====
const approveIdeaFormRef = ref<FormInstance | null>(null)

const approveIdeaModel = ref<ApproveIdeaModelType>({
  agreeOption: '',
  limitation: '',
  basedOption: '',
})

const approveIdeamFormList = ref<FormListItem[]>([
  {
    title: '🤔我同意你观点中的...',
    placeholder: '同意的点',
    model: 'agreeOption',
  },
  {
    title: '😛但是这一观点可能存在以下局限性...',
    placeholder: '输入看法...',
    model: 'limitation',
  },
  {
    title: '😲我的依据是...',
    placeholder: '依据...',
    model: 'basedOption',
  },
])

const approveIdeaFormRules: FormRules = reactive({
  agreeOption: [
    {
      required: true,
      message: '同意的观点不能为空!',
      trigger: 'blur',
    },
  ],
  limitation: [
    {
      required: true,
      message: '观点局限不能为空!',
      trigger: 'blur',
    },
  ],
  basedOption: [
    {
      required: true,
      message: '依据不能为空!',
      trigger: 'blur',
    },
  ],
})

const handleApproveIdea = (payload: { id: string; content: string }) => {
  action.value = Action.approve
  title.value = '回复观点-有点赞成'
  replyToId.value = payload.id
  ideaContent.value = payload.content
  handleViewIdeaDialog()
}

const handleReplyIdea = (params: ReplyIdeaParams) => {
  loading.value = true
  replyIdeaApi(params)
    .then(res => {
      const data: any = res

      if (data.success) {
        ElNotification({
          title: 'Success',
          message: data.message,
          type: 'success',
          position: 'bottom-right',
        })
        handleRefresh()
      } else {
        ElNotification({
          title: 'Error',
          message: data.message,
          type: 'error',
          position: 'bottom-right',
        })
      }
    })
    .finally(() => {
      handleViewIdeaDialog()
      loading.value = false
    })
}

const approveIdeaCallBack = () => {
  const content = `观点是:${approveIdeaModel.value.agreeOption}\n依据是:${approveIdeaModel.value.limitation}\n局限在于:${approveIdeaModel.value.basedOption}`

  const params: ReplyIdeaParams = {
    topic_id: _router.currentRoute.value.query?.topic_id as unknown as number,
    student_id: userStore.userInfo.id,
    content: content,
    reply_to: Number(replyToId.value),
    reply_type: 1,
  }

  handleReplyIdea(params)
}
// ====================

// ===== 不同意观点逻辑 =====
const opposeIdeaFormRef = ref<FormInstance | null>(null)

const opposeIdeaModel = ref<OpposeIdeaModelType>({
  disagreeOption: '',
  myOption: '',
  basedOption: '',
})

const opposeIdeaFormList = ref<FormListItem[]>([
  {
    title: '🤔我不认同你观点中的...',
    placeholder: '不赞同的点',
    model: 'disagreeOption',
  },
  {
    title: '😛我对这一观点的看法是...',
    placeholder: '输入看法...',
    model: 'myOption',
  },
  {
    title: '😲我的依据是...',
    placeholder: '依据...',
    model: 'basedOption',
  },
])

const opposeIdeaFormRules: FormRules = reactive({
  disagreeOption: [
    {
      required: true,
      message: '不同意的观点不能为空!',
      trigger: 'blur',
    },
  ],
  myOption: [
    {
      required: true,
      message: '观点看法不能为空!',
      trigger: 'blur',
    },
  ],
  basedOption: [
    {
      required: true,
      message: '依据不能为空!',
      trigger: 'blur',
    },
  ],
})

const handleOpposeIdea = (payload: { id: string; content: string }) => {
  console.log(payload.content)
  action.value = Action.oppose
  title.value = '回复观点-有点不赞成'
  ideaContent.value = payload.content
  replyToId.value = payload.id
  handleViewIdeaDialog()
}

const opposeIdeaCallBack = () => {
  const content = `我不同意的观点是:${opposeIdeaModel.value.disagreeOption}\n我的观点是:${opposeIdeaModel.value.myOption}\n我的依据是:${opposeIdeaModel.value.basedOption}`

  const params: ReplyIdeaParams = {
    topic_id: _router.currentRoute.value.query?.topic_id as unknown as number,
    student_id: userStore.userInfo.id,
    content: content,
    reply_to: Number(replyToId.value),
    reply_type: 0,
  }
  handleReplyIdea(params)
}
// =====================

// ===== 修改自己观点逻辑 ===
const reviseIdeaFormRef = ref<FormInstance | null>(null)

const reviseSelfFormModel = ref<ReviseSelfFormModelType>({
  limitation: '',
  basedOption: '',
  newOption: '',
})

const reviseIdeaFormList = ref<FormListItem[]>([
  {
    title: '🤔原先观点的局限性',
    placeholder: '请输入你的观点中的局限性',
    model: 'limitation',
  },
  {
    title: '😲你的依据是',
    placeholder: '请输入你的依据',
    model: 'basedOption',
  },
  {
    title: '😛修正后的观点',
    placeholder: '请输入修正后的观点',
    model: 'newOption',
  },
])

const reviseFormRules: FormRules = reactive({
  limitation: [
    {
      required: true,
      message: '局限性不能为空!',
      trigger: 'blur',
    },
  ],
  basedOption: [
    {
      required: true,
      message: '依据不能为空!',
      trigger: 'blur',
    },
  ],
  newOption: [
    {
      required: true,
      message: '观点不能为空!',
      trigger: 'blur',
    },
  ],
})

const handleReviseSelfIead = (payload: { id: string; content: string }) => {
  action.value = Action.revise
  title.value = '修改观点'
  ideaContent.value = payload.content
  replyToId.value = payload.id
  handleViewIdeaDialog()
}

const reviseIdeaCallBack = () => {
  const content = `新的观点是:${reviseSelfFormModel.value.newOption}\n依据是:${reviseSelfFormModel.value.basedOption}\n原先观点的局限在于:${reviseSelfFormModel.value.limitation}`

  const params: ReviseSelfIdeaParams = {
    node_id: Number(replyToId.value),
    content: content,
    student_id: userStore.userInfo.id,
  }

  reviseSelfIdeaApi(params)
    .then(res => {
      const data: any = res
      if (data.success) {
        ElNotification({
          title: '成功',
          message: '修改成功',
          type: 'success',
          position: 'bottom-right',
        })
        handleRefresh()
      }
    })
    .finally(() => {
      handleViewIdeaDialog()
    })
}

// ===== 总结观点逻辑 ====
const summaryIdeaFormRef = ref<FormInstance | null>(null)

const summaryIdeaModel = ref<SummaryIdeaModelType>({
  summary: '',
})

const summaryFormList = ref<FormListItem[]>([
  {
    title: '总结观点',
    placeholder: '总结本组的观点',
    model: 'summary',
  },
])

const summaryFormRules: FormRules = reactive({
  summary: [
    {
      required: true,
      message: '总结不能为空!',
      trigger: 'blur',
    },
  ],
})

const handleSummaryIdea = (payload: { content: string } = { content: '' }) => {
  action.value = Action.summary
  title.value = '总结本组的观点'
  if (payload.content !== '') {
    ideaContent.value = payload.content
  } else {
    // 查找nodes表
    const { nodes } = vueFlowRef.value?.getNodesAndEdges()

    let content = ''

    const group_id = userStore.userInfo.group_id as number
    nodes.forEach(node => {
      if (node.type === 'group' && node.data.group_id === group_id) {
        content += node.data.groupConclusion
      }
    })

    ideaContent.value = content
  }
  handleViewIdeaDialog()
}

// 刷新页面
const handleRefresh = () => {
  vueFlowRef.value?.refresh()
}

const summaryIdeaCallBack = () => {
  const params: ReviseGroupConclusionParams = {
    topic_id: _router.currentRoute.value.query?.topic_id as unknown as number,
    group_id: userStore.userInfo.group_id as number,
    student_id: userStore.userInfo.id,
    conclusion: summaryIdeaModel.value.summary,
  }
  reviseGroupConclusionApi(params)
    .then(res => {
      const data: any = res
      if (data.success) {
        ElNotification({
          title: 'Success',
          message: data.message,
          type: 'success',
          position: 'bottom-right',
        })
        handleRefresh()
      } else {
        ElNotification({
          title: 'Error',
          message: data.message,
          type: 'error',
          position: 'bottom-right',
        })
      }
    })
    .catch(err => {
      ElNotification({
        title: 'Error',
        message: '服务器有点累~',
        type: 'error',
        position: 'bottom-right',
      })
      console.log(err)
    })
    .finally(() => {
      handleViewIdeaDialog()
    })
}

// =====================

const callBackObj = {
  [Action.proposal]: proposeIdeaCallBack,
  [Action.oppose]: opposeIdeaCallBack,
  [Action.approve]: approveIdeaCallBack,
  [Action.summary]: summaryIdeaCallBack,
  [Action.revise]: reviseIdeaCallBack,
}

const formRefs = {
  [Action.proposal]: proposeIdeaFormRef,
  [Action.oppose]: opposeIdeaFormRef,
  [Action.approve]: approveIdeaFormRef,
  [Action.summary]: summaryIdeaFormRef,
  [Action.revise]: reviseIdeaFormRef,
}

// 根据当前的状态选择回调函数
const handleSwitchCallback = () => {
  if (formRefs[action.value]) {
    formRefs[action.value]!.value!.validate(valid => {
      if (valid) {
        callBackObj[action.value]!.call()
      }
    })
  }
}

/**
 * 可以设置图像显示的默认值
 */
enum ViewPortPos {
  groupNode = 'groupNode',
  allNodes = 'allNodes',
}

interface Setting {
  layOutDirection: LayoutDirection
  viewPortPosition: ViewPortPos
  highlightSelfNode: boolean
}

const setting = ref<Setting>({
  layOutDirection: LayoutDirection.Vertical, // 垂直布局 or 水平布局,
  viewPortPosition: ViewPortPos.groupNode, // 显示的位置
  highlightSelfNode: false, // 高亮自己的节点
})

const settingFlowView = () => {}

const testGroundVisible = ref(true)

const defaultThemeColor = useCssVar('--default-theme-color')
</script>

<template>
  <section class="dialog-container" v-show="visible">
    <el-dialog v-model="visible" width="700" :append-to-body="false">
      <el-card>
        <template #header>
          <h1>{{ title }}</h1>
        </template>

        <el-form
          :model="proposeIdeaModel"
          :rules="proposeIdeaFormRules"
          ref="proposeIdeaFormRef"
          style="max-width: 700px"
          v-if="action === Action.proposal"
        >
          <el-form-item
            v-for="(item, index) in proposeIdeaFormList"
            :prop="item.model"
          >
            <h3>{{ item.title }}</h3>
            <el-input
              :key="index"
              v-model="proposeIdeaModel[item.model]"
              :placeholder="item.placeholder"
              type="textarea"
              rows="4"
              show-word-limit
              maxlength="200"
            ></el-input>
          </el-form-item>
        </el-form>

        <el-form
          :model="approveIdeaModel"
          :rules="approveIdeaFormRules"
          ref="approveIdeaFormRef"
          style="max-width: 700px"
          v-else-if="action === Action.approve"
        >
          <el-text
            ><strong>当前正在回应的观点是: </strong>{{ ideaContent }}</el-text
          >
          <el-divider></el-divider>
          <el-form-item
            v-for="(item, index) in approveIdeamFormList"
            :prop="item.model"
          >
            <h3>{{ item.title }}</h3>
            <el-input
              :key="index"
              v-model="approveIdeaModel[item.model]"
              :placeholder="item.placeholder"
              type="textarea"
              rows="4"
              show-word-limit
              maxlength="200"
            ></el-input>
          </el-form-item>
        </el-form>

        <el-form
          :model="opposeIdeaModel"
          style="max-width: 700px"
          ref="opposeIdeaFormRef"
          :rules="opposeIdeaFormRules"
          v-else-if="action === Action.oppose"
        >
          <el-text
            ><strong>当前正在回应的观点是: </strong>{{ ideaContent }}</el-text
          >
          <el-divider></el-divider>
          <el-form-item
            v-for="(item, index) in opposeIdeaFormList"
            :prop="item.model"
          >
            <h3>{{ item.title }}</h3>
            <el-input
              :key="index"
              v-model="opposeIdeaModel[item.model]"
              :placeholder="item.placeholder"
              type="textarea"
              rows="4"
              show-word-limit
              maxlength="200"
            ></el-input>
          </el-form-item>
        </el-form>

        <el-form
          :model="summaryIdeaModel"
          style="max-width: 700px"
          ref="summaryIdeaFormRef"
          :rules="summaryFormRules"
          v-else-if="action === Action.summary"
        >
          <el-text
            ><strong>本小组之前的观点为: </strong>{{ ideaContent }}</el-text
          >
          <el-divider></el-divider>
          <el-form-item
            v-for="(item, index) in summaryFormList"
            :prop="item.model"
          >
            <h3>{{ item.title }}</h3>
            <el-input
              :key="index"
              v-model="summaryIdeaModel[item.model]"
              :placeholder="item.placeholder"
              type="textarea"
              rows="4"
              show-word-limit
              maxlength="500"
            ></el-input>
          </el-form-item>
        </el-form>

        <el-form
          :model="reviseSelfFormModel"
          :rules="reviseFormRules"
          ref="reviseIdeaFormRef"
          style="max-width: 700px"
          v-else-if="action === Action.revise"
        >
          <el-text><strong>原先的观点是: </strong>{{ ideaContent }}</el-text>
          <el-divider></el-divider>
          <el-form-item
            v-for="(item, index) in reviseIdeaFormList"
            :prop="item.model"
          >
            <h3>{{ item.title }}</h3>
            <el-input
              :key="index"
              v-model="reviseSelfFormModel[item.model]"
              :placeholder="item.placeholder"
              type="textarea"
              rows="4"
              show-word-limit
              maxlength="200"
            ></el-input>
          </el-form-item>
        </el-form>

        <template #footer>
          <div style="display: flex; justify-content: flex-end; width: 100%">
            <el-button plain @click="handleViewIdeaDialog" :color="themeColor"
              >取消</el-button
            >
            <el-button
              :color="themeColor"
              style="margin-left: 10px"
              @click="handleSwitchCallback"
              :loading="loading"
              >确定
            </el-button>
          </div>
        </template>
      </el-card>
    </el-dialog>

    <!-- TODO: 根据图尔敏的论证模型编写一个组件，用来让学生构建论证 -->
    <el-dialog v-model="testGroundVisible" width="1200" :append-to-body="true">
      <div class="argument-flow-container">
        <argumentFlowComponent></argumentFlowComponent>
      </div>
      <div class="button-footer-container">
        <el-button plain :color="defaultThemeColor">取消</el-button>
        <el-button :color="defaultThemeColor">确定</el-button>
      </div>
    </el-dialog>
  </section>

  <div class="vue-flow-container">
    <flow-component
      ref="vueFlowRef"
      @reply-oppose="handleOpposeIdea"
      @reply-approve="handleApproveIdea"
      @revise="handleSummaryIdea"
      @revise-self="handleReviseSelfIead"
    >
      <div class="layout-panel">
        <button title="发表观点" @click="handleProposeIdea">
          <Icon :name="IconName.Idea" />
        </button>
        <button title="总结观点" @click="handleSummaryIdea({ content: '' })">
          <Icon :name="IconName.Summary" />
        </button>
        <button title="刷新" @click="handleRefresh">
          <Icon :name="IconName.Refresh" />
        </button>
        <button title="返回首页" @click="handleGoHome">
          <Icon :name="IconName.Home" />
        </button>
        <button title="设置" @click="settingFlowView">
          <Icon :name="IconName.Setting" />
        </button>
        <button
          title="垂直排列"
          @click="handleLayoutGraph(LayoutDirection.Vertical)"
        >
          <Icon :name="IconName.Vertical" />
        </button>
        <button
          title="水平排列"
          @click="handleLayoutGraph(LayoutDirection.Horizontal)"
        >
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
