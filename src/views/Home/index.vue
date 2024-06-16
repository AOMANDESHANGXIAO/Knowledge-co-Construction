<script setup lang="ts">
import {ref} from 'vue'
import flowComponent from '@/components/vueFlow/index.vue'
import Icon from "@/components/Icon/flowIcon.vue"
import {useCssVar} from '@vueuse/core'


// TODO: 代码重构，这里写的太屎了

const themeColor = useCssVar('--theme-color')

const vueFlowRef = ref(null)

// panel菜单选项方法
const handleLayoutGraph = (direction) => {
  vueFlowRef.value?.layoutGraph(direction)
}

const handleGoHome = () => {
  console.log('返回首页了')
}


const visible = ref(false)

const ideaForm = ref({
  title: '',
  stuIdea: '',
  basedOption: '',
  limitation: '',
})

const handleViewIdeaDialog = () => {

  visible.value = !visible.value
}


// 控制按钮加载状态
const loading = ref(false)

// 控制不同的弹窗显示
enum Action {
  proposal,
  oppose,
  approve,
  summary
}

const action = ref<Action>(Action.proposal)

const handleSwitchCallback = () => {
  if(action.value === Action.proposal) {
    proposeIdeaCallback()
  } else if(action.value === Action.oppose) {
    replyOpposeCallback()
  } else if(action.value === Action.approve) {
    replyApproveCallback()
  }
}

const proposeIdeaCallback = () => {
  // FIXME: 模拟与后端交互发表观点
  // 发表的观点应该挂到小组节点上
  loading.value = true
  setTimeout(() => {
    const position = {x: 0, y: 0}
    const {nodes, edges} = vueFlowRef.value?.getNodesAndEdges()
    const node = {
      id: `idea${nodes.length + 1}`,
      type: 'idea',
      position,
      data: {name: 'XieBin'}
    }
    const edge = {
      id: `lianjie${nodes.length + 1}`,
      source: `idea${nodes.length + 1}`,
      target: '2',
      animated: true,
      style: {stroke: vueFlowRef?.value.lineNormalColor || ''}
    }
    // 后面要调后端的接口
    nodes.push(node)
    edges.push(edge)
    loading.value = false
    handleViewIdeaDialog()
    vueFlowRef.value?.drawFlow(nodes, edges)
    ElMessage({
      message: '发布观点成功!',
      type: 'success',
    })
  }, 2000)
}

const replyOpposeCallback = () => {
  // FIXME: 模拟与后端交互发表观点
  // 发表的观点应该挂到小组节点上
  loading.value = true
  console.log('回复的id是', replyId.value)
  setTimeout(() => {
    const position = {x: 0, y: 0}
    const {nodes, edges} = vueFlowRef.value?.getNodesAndEdges()
    const node = {
      id: `idea${nodes.length + 1}`,
      type: 'idea',
      position,
      data: {name: 'XieBin'}
    }
    const edge = {
      id: `lianjie${nodes.length + 1}`,
      source: `idea${nodes.length + 1}`,
      target: replyId.value,
      animated: true,
      style: {stroke: vueFlowRef?.value.lineOpposeColor || ''}
    }
    // 后面要调后端的接口
    nodes.push(node)
    edges.push(edge)
    loading.value = false
    handleViewIdeaDialog()
    vueFlowRef.value?.drawFlow(nodes, edges)
    ElMessage({
      message: '反馈成功!',
      type: 'success',
    })
  }, 2000)
}

const replyApproveCallback = () => {
  // FIXME: 模拟与后端交互发表观点
  // 发表的观点应该挂到小组节点上
  loading.value = true
  console.log('回复的id是', replyId.value)
  setTimeout(() => {
    const position = {x: 0, y: 0}
    const {nodes, edges} = vueFlowRef.value?.getNodesAndEdges()
    const node = {
      id: `idea${nodes.length + 1}`,
      type: 'idea',
      position,
      data: {name: 'XieBin'}
    }
    const edge = {
      id: `lianjie${nodes.length + 1}`,
      source: `idea${nodes.length + 1}`,
      target: replyId.value,
      animated: true,
      style: {stroke: vueFlowRef?.value.lineApproveColor || ''}
    }
    // 后面要调后端的接口
    nodes.push(node)
    edges.push(edge)
    loading.value = false
    handleViewIdeaDialog()
    vueFlowRef.value?.drawFlow(nodes, edges)
    ElMessage({
      message: '反馈成功!',
      type: 'success',
    })
  }, 2000)
}


const title = ref('')

const replyId = ref('')

const formItemList = ref([
  {
    title: '🤔你的观点是',
    placeholder: '请输入你的观点',
    model: 'option'
  },
  {
    title: '😲你的依据是',
    placeholder: '请输入你的依据',
    model: 'basedOption'
  },
  {
    title: '😛你的观点的局限在于(选填)',
    placeholder: '请输入你的观点的局限',
    model: 'limitation'
  }
])


const handleViewIdea = () => {
  action.value = Action.proposal
  title.value = '发表观点'
  ideaForm.value = {
    option: '',
    basedOption: '',
    limitation: '',
  }
  formItemList.value = [
    {
      title: '🤔你的观点是',
      placeholder: '请输入你的观点',
      model: 'option'
    },
    {
      title: '😲你的依据是',
      placeholder: '请输入你的依据',
      model: 'basedOption'
    },
    {
      title: '😛你的观点的局限在于(选填)',
      placeholder: '请输入你的观点的局限',
      model: 'limitation'
    }
  ]
  handleViewIdeaDialog()
}

const handleReplyOppose = (data: any) => {
  console.log(data)
  action.value = Action.oppose
  title.value = '不支持该观点'
  replyId.value = data
  ideaForm.value = {
    disagreeOption: '',
    myOpinion: '',
    basedOption: '',
  }
  formItemList.value = [
    {
      title: '🤔我不认同你观点中的...',
      placeholder: '不赞同的点',
      model: 'disagreeOption'
    },
    {
      title: '😛我对这一观点的看法是...',
      placeholder: '输入看法...',
      model: 'myOpinion'
    },
    {
      title: '😲我的依据是...',
      placeholder: '依据...',
      model: 'basedOption'
    },
  ]
  handleViewIdeaDialog()
}

const handleReplyApprove = (data: any) => {
  action.value = Action.approve
  title.value = '支持观点'
  replyId.value = data
  ideaForm.value = {
    agreeOption: '',
    myOpinion: '',
    basedOption: '',
  }
  formItemList.value = [
    {
      title: '🤔我同意你观点中的...',
      placeholder: '同意的点',
      model: 'agreeOption'
    },
    {
      title: '😛但是这一观点可能存在以下局限性...',
      placeholder: '输入看法...',
      model: 'myOpinion'
    },
    {
      title: '😲我的依据是...',
      placeholder: '依据...',
      model: 'basedOption'
    }
  ]
  handleViewIdeaDialog()
}


</script>

<template>
  <section class="dialog-container" v-show="visible">
    <el-dialog v-model="visible" width="700" :append-to-body="false">
      <el-card>
        <template #header>
          <h1>{{ title }}</h1>
        </template>
        <el-form :model="ideaForm" style="max-width: 700px">
          <el-form-item v-for="(item, index) in formItemList">
            <h3>{{ item.title }}</h3>
            <el-input
                :key="index"
                v-model="ideaForm[item.model]"
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
            <el-button plain @click="handleViewIdeaDialog" :color="themeColor">取消</el-button>
            <el-button
                :color="themeColor"
                style="margin-left: 10px"
                @click="handleSwitchCallback"
                :loading="loading"
            >确定
            </el-button
            >
          </div>
        </template>
      </el-card>
    </el-dialog>
  </section>

  <div class="vue-flow-container">
    <flow-component ref="vueFlowRef" @reply-oppose="handleReplyOppose" @replyApprove="handleReplyApprove">
      <div class="layout-panel">
        <button title="发表观点" @click="handleViewIdea">
          <Icon name="idea"/>
        </button>
        <button title="返回首页" @click="handleGoHome">
          <Icon name="home"/>
        </button>
        <button title="设置" @click="handleGoHome">
          <Icon name="setting"/>
        </button>
        <button title="垂直排列" @click="handleLayoutGraph('LR')">
          <Icon name="horizontal"/>
        </button>
        <button title="水平排列" @click="handleLayoutGraph('TB')">
          <Icon name="vertical"/>
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