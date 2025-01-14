<script lang="ts" setup>
import router from '@/router/index.ts'
defineOptions({
  name: '404-page'
})

const backHome = () => {
  router.push({ path: '/' })
}
</script>

<template>
  <div>
    <h1>404 NOT FOUND!</h1>
    <n-button type="primary" @click="backHome"
      >回到首页</n-button
    >
  </div>
</template>

<style lang="scss" scoped></style>
