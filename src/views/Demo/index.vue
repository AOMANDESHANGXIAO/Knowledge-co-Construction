<script setup lang="ts">
import useGraph from '@/hooks/Graph/useGraph.ts'
import { graphOptions } from '@/hooks/graphOption.ts'
import type { useGraphProps } from '../../hooks/Graph/useGraph.ts'
import floatButtonGroup from '@/components/common/floatButtonGroup.vue'
import { ref } from 'vue'
import { useDivDrag } from '../../hooks/Element/useDivDrag.ts'

const data = ref<useGraphProps>({
  // 节点
  nodes: [
    {
      id: 'node1', // String，可选，节点的唯一标识
      x: 40, // Number，必选，节点位置的 x 值
      y: 40, // Number，必选，节点位置的 y 值
      width: 80, // Number，可选，节点大小的 width 值
      height: 40, // Number，可选，节点大小的 height 值
      label: 'hello', // String，节点标签
    },
    {
      id: 'node2', // String，节点的唯一标识
      x: 160, // Number，必选，节点位置的 x 值
      y: 180, // Number，必选，节点位置的 y 值
      width: 80, // Number，可选，节点大小的 width 值
      height: 40, // Number，可选，节点大小的 height 值
      label: 'world', // String，节点标签
    },
  ],
  // 边
  edges: [
    {
      source: 'node1', // String，必须，起始节点 id
      target: 'node2', // String，必须，目标节点 id
    },
  ],
  graphOptions,
})
const { container, addNode, addEdge } = useGraph(data.value as useGraphProps)

// 弹窗
const visible = ref(false)

interface Idea {
  title: string
  stuIdea: string
  basedOption: string
  limitation: string
}
const ideaForm = ref<Idea>({
  title: '',
  stuIdea: '',
  basedOption: '',
  limitation: '',
})

const handleProposeIdea = () => {
  // 添加一个节点
  const node = {
    width: 80,
    height: 80,
    label: ideaForm.value.title,
  }
  if (addNode(node)) {
    ElMessage({
      message: '添加节点成功!',
      type: 'success',
    })
  } else {
    ElMessage({
      message: '添加节点失败!',
      type: 'error',
    })
  }
  handleViewIdeaDialog()
}
const handleViewIdeaDialog = () => {
  visible.value = !visible.value
}

const { dragBoxRef } = useDivDrag()
</script>

<template>
  <section class="button-group-container" ref="dragBoxRef">
    <float-button-group ref="buttonGroupRef">
      <el-button color="" plain type="success" round icon="refresh"
        >刷新页面</el-button>
      <el-button
        color="#AF47D2"
        @click="handleViewIdeaDialog"
        plain
        round
        icon="plus"
        >分享观点</el-button
      >
      <el-button color="#E88D67" plain type="danger" round icon="star"
        >升华观点</el-button
      >
    </float-button-group>
  </section>
  <div ref="container" style="width: 100vw; height: 100vh"></div>
  <el-dialog v-model="visible" title="发表观点" width="500" draggable>
    <el-form :model="ideaForm" label-width="auto" style="max-width: 500px">
      <el-form-item label="观点名称">
        <el-input
          v-model="ideaForm.title"
          placeholder="为观点取个名字!"
        ></el-input>
      </el-form-item>
      <el-form-item label="你的观点是">
        <el-input
          v-model="ideaForm.stuIdea"
          placeholder="请输入你的观点"
          type="textarea"
        ></el-input>
      </el-form-item>
      <el-form-item label="你的依据是">
        <el-input
          v-model="ideaForm.basedOption"
          placeholder="请输入你的依据"
          type="textarea"
        ></el-input>
      </el-form-item>
      <el-form-item label="你的观点的局限在于">
        <el-input
          v-model="ideaForm.limitation"
          placeholder="请输入你观点的局限性"
          type="textarea"
        ></el-input>
      </el-form-item>
      <el-form-item>
        <div style="display: flex; justify-content: flex-end; width: 100%">
          <el-button plain @click="handleViewIdeaDialog">取消</el-button>
          <el-button
            type="primary"
            style="margin-left: 10px"
            @click="handleProposeIdea"
            >确定</el-button
          >
        </div>
      </el-form-item>
    </el-form>
  </el-dialog>
</template>

<style scoped lang="scss">
.button-group-container {
  position: fixed;
  z-index: 10;
  right: 140px;
  bottom: 140px;
}
:deep(.el-button) {
  margin: 0;
}
</style>
