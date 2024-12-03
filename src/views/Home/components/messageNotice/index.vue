<script lang="ts" setup>
defineOptions({
  name: 'index',
})
</script>

<template>
  <div class="msg-notice-layout">
    <n-collapse>
      <n-collapse-item title="回应我的" name="1">
        <div class="item-container">
          <div class="content">张三赞同了你</div>
          <n-button type="primary">回 应</n-button>
        </div>
      </n-collapse-item>
      <n-collapse-item title="向我提问的" name="2">
        <div>很好</div>
      </n-collapse-item>
    </n-collapse>
  </div>
</template>

<style lang="scss" scoped>
.msg-notice-layout {
  min-width: 200px;
  .item-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px;
    height: 100px;
  }
}
</style>
