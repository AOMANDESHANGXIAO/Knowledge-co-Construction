<script setup lang="ts">
import {Handle, Position} from "@vue-flow/core";

interface ideaNodeProps {
  data: {
    id: string
    name: string
    sourcePosition: string
    targetPosition: string
  }
}
const props = withDefaults(defineProps<ideaNodeProps>(), {
  data: () => ({
    id: 'ideaNodeid',
    name: '学生',
    sourcePosition: Position.Bottom,
    targetPosition: Position.Top
  })
})

</script>

<template>
  <div class="idea-node">
    <Handle type="target" :position="props.data.targetPosition"/>
    <Handle type="source" :position="props.data.sourcePosition"/>
    <span>{{ props.data.name }}</span>
  </div>
</template>

<style scoped lang="scss">
$node-width:80px;
.idea-node {
  width: $node-width;
  height: $node-width;
  border-radius: 50%;
  background-color: #FB6D48;
  color: #fff;
  font-size: 18px;
  text-align: center;
  line-height: $node-width;
}
</style>