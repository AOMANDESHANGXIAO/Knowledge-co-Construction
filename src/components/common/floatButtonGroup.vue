<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  width: {
    type: Number,
    default: 50
  },
  height: {
    type: Number,
    default: 150
  },
  position :{
    type: String,
    default: 'fixed'
  },
  top: {
    type: Number,
    default: null
  },
  bottom: {
    type: Number,
    default: undefined
  },
  left: {
    type: Number,
    default:undefined
  },
  right: {
    type: Number,
    default: undefined
  }
})
const Style = computed(() => {
  return {
    position: props.position,
    top: props.top? `${props.top}px`:props.top,
    right: props.right? `${props.right}px`:props.right,
    bottom: props.bottom? `${props.bottom}px`:props.bottom,
    left: props.left? `${props.left}px`:props.left,
  }
})

</script>

<template>
  <div class="float-button-group" :style="Style">
    <slot></slot>
  </div>
</template>

<style scoped lang="scss">
.float-button-group {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap:10px;
  padding: 20px;
  box-shadow:0 2px 8px 0px rgba(0, 0, 0, .16);
  background-color: #fff;
  z-index:10;
  transition: all .5s;
  &:hover {
    box-shadow: 0 2px 12px 0px rgba(0, 0, 0, .24);
  }
}
</style>