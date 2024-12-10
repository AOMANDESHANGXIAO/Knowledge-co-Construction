<script setup lang="ts">
import { useRoute } from 'vue-router'
const route = useRoute()
</script>

<template>
  <n-notification-provider>
    <n-message-provider>
      <router-view :key="route.path" />
    </n-message-provider>
  </n-notification-provider>
</template>

<style scoped lang="scss"></style>
