<script lang="ts" setup>
/**
 * @deprecated 该组件已弃用
 */
import { Handle, Position } from '@vue-flow/core'
defineOptions({
  name: 'ConnectionComponent',
})
</script>

<template>
  <div class="connection-component-container">
    <Handle
      type="source"
      :position="Position.Bottom"
      :connectable="false"
    ></Handle>
    <Handle
      type="target"
      :position="Position.Top"
      :connectable="false"
    ></Handle>
  </div>
</template>

<style lang="scss" scoped>
$circle-diameter: 20px;
.connection-component-container {
  width: $circle-diameter;
  height: $circle-diameter;
  border-radius: 50%;
  background-color: #45474b;
}

.vue-flow__handle {
  // height: 24px;
  // width: 10px;
  background: transparent;
  border: none;
  // border-radius: 4px;
}
</style>
