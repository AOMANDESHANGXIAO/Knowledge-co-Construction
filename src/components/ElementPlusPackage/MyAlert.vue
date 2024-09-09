<script lang="ts" setup>
defineOptions({
  name: 'my-alert',
})

const props = defineProps<{
  list?: string[]
}>()
</script>

<template>
  <el-alert v-bind="$attrs">
    <template #title>
      <div class="title">{{ $attrs.title }}</div>
    </template>
    <div class="content-item" v-for="(item, index) in props.list" :key="index">
      {{ `${index + 1}. ${item}` }}
    </div>
  </el-alert>
</template>

<style lang="scss" scoped>
.title {
  font-size: 19px;
  font-weight: bold;
}
</style>
