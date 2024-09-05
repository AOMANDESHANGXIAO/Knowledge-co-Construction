<script setup lang="ts">
import flowComponent from '@/components/vueFlow/index.vue'
import { LayoutDirection } from '@/components/vueFlow/type.ts'
import Icon from '@/components/Icons/HomePageIcon/index.vue'
import { IconName } from '@/components/Icons/HomePageIcon/type.ts'
import argumentFlowComponent from './components/ArgumentFlowComponent/index.vue'
import MyButton from '@/components/ElementPlusPackage/MyButton.vue'
import { useMyVueFlow } from './hook.ts'
import { useUserStore } from '../../store/modules/user/index'
import useQueryParam from '@/hooks/router/useQueryParam'
// import useRefresh from '../../hooks/Element/useRefresh'

const topicId = useQueryParam<number>('topic_id')

const { getOneUserInfo } = useUserStore()

const studentId = getOneUserInfo('id') as string

const {
  topicContent,
  key,
  nodeId,
  reply,
  argumentFlowRef,
  vueFlowRef,
  visible,
  sumbitStatus,
  loading,
  setVisible,
  handleIdeaAction,
  handleSumbit,
  handleLayout,
  refreshVueFlow
} = useMyVueFlow({
  topic_id: topicId.value,
  student_id: +studentId,
})

// TODO: 后端实现后对接
const onReviseIdea = (nodeId: string) => {
  console.log('学生修改观点', nodeId)
}

const onCheckIdea = (nodeId: string) => {
  // console.log('学生检查观点', nodeId)
  handleIdeaAction('check', { id: nodeId })
}
</script>

<template>
  <section class="dialog-container" v-show="visible">
    <el-dialog v-model="visible" width="1200" :append-to-body="true">
      <div class="argument-flow-container">
        <argumentFlowComponent
          ref="argumentFlowRef"
          v-model:status="sumbitStatus"
          :node-id="nodeId"
          :key="key"
          :topic-content="topicContent"
          v-model:reply="reply"
        ></argumentFlowComponent>
      </div>
      <div class="button-footer-container">
        <my-button @click="setVisible(false)" _type="Cancel"></my-button>
        <my-button
          @click="handleSumbit"
          _type="OK"
          :loading="loading"
        ></my-button>
      </div>
    </el-dialog>
  </section>

  <div class="vue-flow-container">
    <flow-component
      ref="vueFlowRef"
      @reviseIdea="onReviseIdea"
      @checkIdea="onCheckIdea"
    >
      <div class="layout-panel">
        <button title="发表观点" @click="handleIdeaAction('propose')">
          <Icon :name="IconName.Idea" />
        </button>
        <!-- TODO: 后端实现后对接 -->
        <button title="总结观点" @click="">
          <Icon :name="IconName.Summary" />
        </button>
        <button title="刷新" @click="refreshVueFlow">
          <Icon :name="IconName.Refresh" />
        </button>
        <button title="返回首页" @click="">
          <Icon :name="IconName.Home" />
        </button>
        <!-- TODO: 最后写 -->
        <button title="设置" @click="">
          <Icon :name="IconName.Setting" />
        </button>
        <button
          title="垂直排列"
          @click="handleLayout(LayoutDirection.Vertical)"
        >
          <Icon :name="IconName.Vertical" />
        </button>
        <button
          title="水平排列"
          @click="handleLayout(LayoutDirection.Horizontal)"
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
