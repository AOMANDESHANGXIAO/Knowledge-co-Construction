<script setup lang="ts">
import { useRoute } from 'vue-router'
const route = useRoute()
</script>

<template>
  <router-view :key="route.path" />
</template>

<style scoped lang="scss"></style>
