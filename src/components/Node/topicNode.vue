<script setup lang='ts'>
// import { ref } from 'vue'
// interface NodeDTO {
//   nodeId?: string
//   text: string
// }

const props = defineProps({
  text: {
    type: String,
    default: 'Node Special'
  },
  data: {
    type: Object,
    default: () => {
      return {
        text: '默认话题'
      }
    }
  }
})
const handleClick = () => {
  console.log('click')
}
</script>

<template>
  <div class="container" @click="handleClick">
    <div class="title">😯讨论话题😯</div>
    <div class="content">
      <el-text>{{props.data.text}}</el-text>
    </div>
  </div>
</template>

<style scoped lang="scss">
.container {
  width: 180px;
  border-radius: 10px;
  background-color:#F3F7EC;
  &:hover {
    background-color: darken(#F3F7EC, 10%);
  }
  .title {
    width: 100%;
    height: 40px;
    line-height: 40px;
    text-align: center;
    color: #f9f9f9;
    background-color: #67c23a;
  }
  .content {
    width: 100%;
    max-height: 300px;
    overflow: hidden;
    padding: 10px;
    font-size: 20px;
    color: #242424;
  }
}
</style>