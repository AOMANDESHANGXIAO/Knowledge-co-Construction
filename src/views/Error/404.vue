<script lang="ts" setup>
import router from '@/router/index.ts'
defineOptions({
  group_name: '404-page',
})

const backHome = () => {
  router.push({ path: '/' })
}
</script>

<template>
  <div>
    <h1>404 NOT FOUND!</h1>
    <el-button type="primary" size="large" @click="backHome"
      >回到首页</el-button
    >
  </div>
</template>

<style lang="scss" scoped></style>
