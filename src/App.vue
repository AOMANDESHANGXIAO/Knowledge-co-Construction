<script setup lang="ts">
</script>

<template>
  <n-notification-provider>
    <n-message-provider>
      <router-view :key="$route.fullPath" />
    </n-message-provider>
  </n-notification-provider>
</template>

<style scoped lang="scss"></style>
