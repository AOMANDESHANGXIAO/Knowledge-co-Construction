<script setup>
import { ref } from 'vue'
import flowComponent from '@/components/vueFlow/index.vue'


const searchValue = ref('')
const tabList = ref([ '人工智能', '机器学习', 'Python编程'])
</script>

<template>
  <el-row>
<!--    <el-col :span="3">-->
<!--      <div class="tab-bar-container">-->
<!--        <section class="search">-->
<!--          <el-input v-model="searchValue" placeholder="搜索讨论话题">-->
<!--            <template #prefix>-->
<!--              <el-icon><search /></el-icon>-->
<!--            </template>-->
<!--          </el-input>-->
<!--        </section>-->
<!--        <section class="menu-container">-->
<!--          <el-menu>-->
<!--            <el-sub-menu index="1">-->
<!--              <template #title>-->
<!--                <el-icon><location /></el-icon>-->
<!--                <span>我管理的</span>-->
<!--              </template>-->
<!--              <el-menu-item-group title="Group One">-->
<!--                <el-menu-item index="1-1">item one</el-menu-item>-->
<!--                <el-menu-item index="1-2">item two</el-menu-item>-->
<!--              </el-menu-item-group>-->
<!--              <el-menu-item-group title="Group Two">-->
<!--                <el-menu-item index="1-3">item three</el-menu-item>-->
<!--              </el-menu-item-group>-->
<!--              <el-sub-menu index="1-4">-->
<!--                <template #title>item four</template>-->
<!--                <el-menu-item index="1-4-1">item one</el-menu-item>-->
<!--              </el-sub-menu>-->
<!--            </el-sub-menu>-->
<!--          </el-menu>-->
<!--        </section>-->
<!--      </div>-->
<!--    </el-col>-->
    <el-col :span="22">
      <div class="vue-flow-container">
        <flow-component></flow-component>
      </div>
    </el-col>
    <el-col :span="2">
      <div class="group-manage-container"></div>
    </el-col>
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