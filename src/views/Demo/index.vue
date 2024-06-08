<script setup lang="ts">
import useGraph from "@/views/Demo/useGraph.ts";
import { graphOptions } from "@/views/Demo/graphOption.ts";
import type { useGraphProps } from './useGraph.ts'
import floatButtonGroup from "@/components/common/floatButtonGroup.vue";
import { ref } from 'vue'
// import { ElMessage } from "element-plus";

const data = ref<useGraphProps>({
  // 节点
  nodes: [
    {
      id: 'node1', // String，可选，节点的唯一标识
      x: 40,       // Number，必选，节点位置的 x 值
      y: 40,       // Number，必选，节点位置的 y 值
      width: 80,   // Number，可选，节点大小的 width 值
      height: 40,  // Number，可选，节点大小的 height 值
      label: 'hello', // String，节点标签
    },
    {
      id: 'node2', // String，节点的唯一标识
      x: 160,      // Number，必选，节点位置的 x 值
      y: 180,      // Number，必选，节点位置的 y 值
      width: 80,   // Number，可选，节点大小的 width 值
      height: 40,  // Number，可选，节点大小的 height 值
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
  graphOptions
});
const { container, addNode, addEdge } = useGraph(data.value as useGraphProps)

// 弹窗
const visible = ref(false)


interface Idea {
  title:string,
  stuIdea: string
  basedOption: string
  limitation: string
}
const ideaForm = ref<Idea>({
  title:'',
  stuIdea: '',
  basedOption:'',
  limitation:'',
})


const handleProposeIdea = () => {
  // 添加一个节点
  const node = {
    width: 80,
    height: 80,
    label: ideaForm.value.title
  }
  if(addNode(node)) {
    ElMessage({
      message: '添加节点成功!',
      type: 'success'
    })
    console.log('添加节点成功!')
  } else {
    ElMessage({
      message: '添加节点失败!',
      type: 'error'
    })
    console.log('添加节点失败')
  }
  handleViewIdeaDialog()
}
const handleViewIdeaDialog = () => {
  visible.value = !visible.value
}
</script>

<template>
  <float-button-group position="fixed" :bottom="60" :right="60">
    <el-button @click="handleViewIdeaDialog" plain type="primary">新建观点</el-button>
    <el-button plain type="success">刷新页面</el-button>
    <el-button plain type="warning">提出问题</el-button>
    <el-button plain type="info">提交请求</el-button>
    <el-button plain type="danger">总结观点</el-button>
  </float-button-group>
  <div ref="container" style="width: 100vw;height: 100vh"></div>
  <el-dialog v-model="visible" title="发表观点" width="500" draggable>
    <el-form :model="ideaForm" label-width="auto" style="max-width: 500px">
      <el-form-item label="观点名称">
        <el-input v-model="ideaForm.title" placeholder="为观点取个名字!"></el-input>
      </el-form-item>
      <el-form-item label="你的观点是">
        <el-input v-model="ideaForm.stuIdea" placeholder="请输入你的观点" type="textarea"></el-input>
      </el-form-item>
      <el-form-item label="你的依据是">
        <el-input v-model="ideaForm.basedOption" placeholder="请输入你的依据" type="textarea"></el-input>
      </el-form-item>
      <el-form-item label="你的观点的局限在于">
        <el-input v-model="ideaForm.limitation" placeholder="请输入你观点的局限性" type="textarea"></el-input>
      </el-form-item>
      <el-form-item>
        <div style="display:flex;justify-content: flex-end;width: 100%">
          <el-button plain @click="handleViewIdeaDialog">取消</el-button>
          <el-button type="primary" style="margin-left:10px" @click="handleProposeIdea">确定</el-button>
        </div>
      </el-form-item>
    </el-form>
  </el-dialog>
  <!-- <el-dialog></el-dialog> -->
</template>

<style scoped lang="scss">
:deep(.el-button) {
  margin: 0;
}
</style>