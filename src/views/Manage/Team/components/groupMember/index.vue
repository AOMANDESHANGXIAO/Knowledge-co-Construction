<script lang="ts" setup>
defineOptions({
  name: 'group-member-item',
})

interface Props {
  name: string
  id: string | number
  title?: string // 头衔
}
interface Data {
  discussNum?: number
  feedbackNum?: number
  summaryNum?: number
  proposeNum?: number
  [propName: string]: any
}

const props = defineProps<Props>()

const emits = defineEmits(['click'])

const data = ref<Data>({})

const handleClick = () => {
  if (data.value?.discussNum) {
    // 说明已经有数据
    return
  }
  emits('click', { id: +props.id, callBack: setData })
}

const setData = (newVal: Data) => {
  data.value = newVal
}

defineExpose({ setData })
</script>

<template>
  <el-popover placement="right" :width="150" trigger="click">
    <template #reference>
      <span class="group-member-item" @click="handleClick">
        {{ props.name }}
      </span>
    </template>
    <!-- 个人参与统计 -->
    <ul>
      <li>参与了讨论:{{ data?.discussNum || 0 }}次</li>
      <li>分享过观点:{{ data?.proposeNum || 0 }}次</li>
      <li>反馈过观点:{{ data?.feedbackNum || 0 }}次</li>
      <li>总结过观点:{{ data?.summaryNum || 0 }}次</li>
    </ul>
  </el-popover>
</template>

<style lang="scss" scoped>
.group-member-item {
  margin-right: 10px;
  &:hover {
    cursor: pointer;
    text-decoration: underline;
    color: var(--theme-color);
  }
}
ul li {
  list-style: none;
}
</style>
