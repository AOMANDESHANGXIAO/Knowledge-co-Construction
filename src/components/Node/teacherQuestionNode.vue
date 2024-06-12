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
    <div>发布话题</div>
    <el-text>本次讨论的问题:{{props.data.text}}</el-text>
  </div>
</template>

<style scoped lang="scss">
.container {
  display: flex;
  justify-content: center;
  align-items: center;
  //width: 250px;
  //height: 150px;
  padding: 20px;
  //border-radius: 75px;
  max-width: 200px;
  border-radius: 10px;
  border: 5px solid #67c23a;
  background-color:#f0f9eb;
  //transform: scale(.6);
  span {
    font-size: 20px;
  }
}
</style>