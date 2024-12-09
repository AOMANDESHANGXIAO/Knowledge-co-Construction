<script setup lang="ts">
import { useRoute } from 'vue-router'
const route = useRoute()
</script>

<template>
  <n-message-provider>
    <router-view :key="route.path" />
  </n-message-provider>
</template>

<style scoped lang="scss"></style>
