<script lang="ts" setup>
defineOptions({
  name: 'group-member-item',
})

interface Title {
  type: string
  text: string
}

interface Data {
  discussNum?: number
  feedbackNum?: number
  summaryNum?: number
  proposeNum?: number
  [propName: string]: any
}

interface Props {
  name: string
  id: string | number
  title?: Title[] // 头衔
  data: Data
}

const props = defineProps<Props>()

</script>

<template>
  <el-popover placement="right" :width="150" trigger="click">
    <template #reference>
      <span class="group-member-item">
        {{ props.name }}
      </span>
    </template>
    <!-- 个人参与统计 -->
    <ul>
      <li>参与了讨论:{{ props.data?.discussNum || 0 }}次</li>
      <li>分享过观点:{{ props.data?.proposeNum || 0 }}次</li>
      <li>反馈过观点:{{ props.data?.feedbackNum || 0 }}次</li>
      <li>总结过观点:{{ props.data?.summaryNum || 0 }}次</li>
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
