<script setup lang="ts">
</script>

<template>
  <div class="float-button-group">
    <slot></slot>
  </div>
</template>

<style scoped lang="scss">
.float-button-group {
  box-sizing: content-box;
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 100px;
  border-radius: 15px;
  gap: 10px;
  padding: 25px;
  box-shadow: 0 2px 8px 0px rgba(0, 0, 0, 0.16);
  background-color: #fff;
  z-index: 10;
  transition: all 0.5s;
  &:hover {
    box-shadow: 0 2px 12px 0px rgba(0, 0, 0, 0.24);
  }
}
</style>
