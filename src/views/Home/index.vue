<script setup lang="ts">
import { ref } from 'vue'
import flowComponent from '@/components/vueFlow/index.vue'
import { LayoutDirection } from '@/components/vueFlow/type.ts'
import Icon from '@/components/Icons/HomePageIcon/index.vue'
import { useColorStore } from '@/store/modules/color'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/modules/user'
import { proposeIdeaApi, replyIdeaApi } from '@/apis/flow/index.ts'
import type { ProposeIdeaParams, ReplyIdeaParams } from '@/apis/flow/type.ts'
import {
  Action,
  FormListItem,
  ProposeIdeaModelType,
  ApproveIdeaModelType,
  OpposeIdeaModelType,
} from './type.ts'

// TODO: 代码重构，这里写的太屎了

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
  console.log('返回首页了')
}

const visible = ref<boolean>(false)

const title = ref('')

const replyToId = ref<string>('')

const handleViewIdeaDialog = () => {
  visible.value = !visible.value
}

// ====提出观点逻辑=====
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

const handleProposeIdea = () => {
  action.value = Action.proposal
  title.value = '提出你的观点!'
  handleViewIdeaDialog()
}

const router = useRouter()

const userStore = useUserStore()

const proposeIdeaCallBack = () => {
  const content = `观点是:${proposeIdeaModel.value.option}\n依据是:${proposeIdeaModel.value.basedOption}\n局限在于:${proposeIdeaModel.value.limitation}`

  const params: ProposeIdeaParams = {
    topic_id: router.currentRoute.value.query?.topic_id as unknown as number,
    student_id: userStore.userInfo.id,
    content: content,
  }
  loading.value = true
  proposeIdeaApi(params)
    .then(res => {
      const data = res.data

      if (data.success) {
        ElNotification({
          title: 'Success',
          message: data.message,
          type: 'success',
        })
        vueFlowRef.value?.refresh()
      } else {
        ElNotification({
          title: 'Error',
          message: data.message,
          type: 'error',
        })
      }
      console.log(res)
    })
    .catch(err => {
      ElNotification({
        title: 'Error',
        message: '服务器有点累~',
        type: 'error',
      })
      console.log(err)
    })
    .finally(() => {
      handleViewIdeaDialog()
      loading.value = false
    })
}

// 控制按钮加载状态
const loading = ref(false)

const action = ref<Action>(Action.proposal)

// ====================

// =====同意观点逻辑=====
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

const handleApproveIdea = (id: string) => {
  action.value = Action.approve
  title.value = '回复观点-有点赞成'
  replyToId.value = id
  handleViewIdeaDialog()
}

const approveIdeaCallBack = () => {
  const content = `观点是:${approveIdeaModel.value.agreeOption}\n依据是:${approveIdeaModel.value.limitation}\n局限在于:${approveIdeaModel.value.basedOption}`

  const params: ReplyIdeaParams = {
    topic_id: router.currentRoute.value.query?.topic_id as unknown as number,
    student_id: userStore.userInfo.id,
    content: content,
    reply_to: Number(replyToId.value),
    reply_type: 1,
  }
  loading.value = true
  replyIdeaApi(params)
    .then(res => {
      const data = res.data

      if (data.success) {
        ElNotification({
          title: 'Success',
          message: data.message,
          type: 'success',
        })
        vueFlowRef.value?.refresh()
      } else {
        ElNotification({
          title: 'Error',
          message: data.message,
          type: 'error',
        })
      }
    })
    .catch(err => {
      ElNotification({
        title: 'Error',
        message: '服务器有点累~',
        type: 'error',
      })
      console.log(err)
    })
    .finally(() => {
      handleViewIdeaDialog()
      loading.value = false
    })
}
// ====================

// ===== 不同意观点逻辑 =====
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

const handleOpposeIdea = (id: string) => {
  action.value = Action.oppose
  title.value = '回复观点-有点不赞成'
  replyToId.value = id
  handleViewIdeaDialog()
}

const opposeIdeaCallBack = () => {
  const content = `我不同意的观点是:${opposeIdeaModel.value.disagreeOption}\n我的观点是:${opposeIdeaModel.value.myOption}\n我的依据是:${opposeIdeaModel.value.basedOption}`

  const params: ReplyIdeaParams = {
    topic_id: router.currentRoute.value.query?.topic_id as unknown as number,
    student_id: userStore.userInfo.id,
    content: content,
    reply_to: Number(replyToId.value),
    reply_type: 1,
  }
  loading.value = true
  replyIdeaApi(params)
    .then(res => {
      const data = res.data

      if (data.success) {
        ElNotification({
          title: 'Success',
          message: data.message,
          type: 'success',
        })
        vueFlowRef.value?.refresh()
      } else {
        ElNotification({
          title: 'Error',
          message: data.message,
          type: 'error',
        })
      }
    })
    .catch(err => {
      ElNotification({
        title: 'Error',
        message: '服务器有点累~',
        type: 'error',
      })
      console.log(err)
    })
    .finally(() => {
      handleViewIdeaDialog()
      loading.value = false
    })
}

// 根据当前的状态选择回调函数
const handleSwitchCallback = () => {
  if (action.value === Action.proposal) {
    proposeIdeaCallBack()
  } else if (action.value === Action.oppose) {
    opposeIdeaCallBack()
  } else if (action.value === Action.approve) {
    approveIdeaCallBack()
  }
}
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
          style="max-width: 700px"
          v-if="action === Action.proposal"
        >
          <el-form-item v-for="(item, index) in proposeIdeaFormList">
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
          style="max-width: 700px"
          v-else-if="action === Action.approve"
        >
          <el-form-item v-for="(item, index) in approveIdeamFormList">
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
          v-else-if="action === Action.oppose"
        >
          <el-form-item v-for="(item, index) in opposeIdeaFormList">
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
  </section>

  <div class="vue-flow-container">
    <flow-component
      ref="vueFlowRef"
      @reply-oppose="handleOpposeIdea"
      @reply-approve="handleApproveIdea"
    >
      <div class="layout-panel">
        <button title="发表观点" @click="handleProposeIdea">
          <Icon name="idea" />
        </button>
        <button title="返回首页" @click="handleGoHome">
          <Icon name="home" />
        </button>
        <button title="设置" @click="handleGoHome">
          <Icon name="setting" />
        </button>
        <button
          title="垂直排列"
          @click="handleLayoutGraph(LayoutDirection.Vertical)"
        >
          <Icon name="horizontal" />
        </button>
        <button
          title="水平排列"
          @click="handleLayoutGraph(LayoutDirection.Horizontal)"
        >
          <Icon name="vertical" />
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
</style>
