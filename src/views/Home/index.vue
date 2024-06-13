<script setup>
import { ref } from 'vue'
import flowComponent from '@/components/vueFlow/index.vue'

//
// const searchValue = ref('')
// const tabList = ref([ '人工智能', '机器学习', 'Python编程'])

const vueFlowRef = ref(null)
</script>

<template>
  <el-row>
    <el-col :span="2">
      <div class="tab-bar-container"></div>
    </el-col>
    <el-col :span="22">
      <div class="vue-flow-container">
        <flow-component ref="vueFlowRef"></flow-component>
      </div>
    </el-col>
<!--    <el-col :span="2">-->
<!--      <div class="group-manage-container"></div>-->
<!--    </el-col>-->
  </el-row>
  <section class="layout-container"></section>
</template>

<style scoped lang="scss">

.tab-bar-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100vh;
  background-color: pink;
  .search {
    padding: 10px;
    background-color: #615EFC;
    &:deep(.el-input__wrapper) {
      border-radius: 15px;

    }
    &:deep(.el-input__wrapper.is-focus) {
      box-shadow: none;
      border: none;
    }
  }
  .menu-container {
    flex:1;
    width: 100%;
    background-color: #615EFC;
  }
}
.group-manage-container {
  width: 100%;
  height: 100vh;
  background-color: skyblue;
}
.vue-flow-container {
  width: 100%;
  height: 100vh;
  box-sizing: border-box;
  //border-left: 10px solid #615EFC ;
}
</style>