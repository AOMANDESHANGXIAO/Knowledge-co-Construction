<script lang="ts" setup>
import { THEME_COLOR } from '@/config'
defineOptions({
  name: 'my-alert',
})

const props = defineProps<{
  list?: string[]
  patterns?: string[]
}>()
const hlStyle = computed(() => {
  return {
    backgroundColor: THEME_COLOR,
    color: '#fff',
  }
})
</script>

<template>
  <n-alert v-bind="$attrs">
    <div class="content-item" v-for="(item, index) in props.list" :key="index">
      <n-highlight
        :text="`${index + 1}. ${item}`"
        :patterns="props.patterns"
        :highlight-style="hlStyle"
      >
      </n-highlight>
    </div>
  </n-alert>
</template>

<style lang="scss" scoped>
.title {
  font-size: 19px;
  font-weight: bold;
}
</style>
