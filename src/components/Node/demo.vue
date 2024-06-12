<script setup lang='ts'>
import { inject, onMounted,ref } from "vue";
import { Node } from '@antv/x6'

interface NodeDTO {
  nodeId?: string
  nodeName: string
}

const getNode: Function | undefined = inject<Function>("getNode");
const data =  ref<NodeDTO|undefined>(undefined)
onMounted(() => {
  const node = getNode?.() as Node;
  data.value = node?.getData()
});
</script>

<template>
  <div class="demo-node-template">
    <span>{{data?.nodeName}}</span>
  </div>
</template>

<style scoped lang="scss">
.demo-node-template {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 150px;
  height: 150px;
  //border-radius: 50%;
  background-color: #615EFC;
  span {
    color: #f9f9f9;
  }
}
</style>