<script lang="ts" setup>
import icon from '../icons/index.vue'
import {  Props } from './type.ts'
defineOptions({
  name: 'group-member-item',
})

const props = defineProps<Props>()
</script>

<template>
  <el-popover placement="right" trigger="click" width="150">
    <template #reference>
      <div class="group-member-item">
        <div class="icons">
          <icon v-for="item in props.title" :iconName="item.type" />
        </div>
        <div class="name">{{ props.name }}</div>
      </div>
    </template>
    <!-- 个人参与统计 -->
    <ul>
      <li v-for="t in props.title" :key="t.text">
        <span class="title-text"> {{ t.text }}👑</span>
      </li>
      <li>参与了讨论:{{ props.data?.discussNum || 0 }}次</li>
      <li>分享过观点:{{ props.data?.proposeNum || 0 }}次</li>
      <li>反馈过观点:{{ props.data?.feedbackNum || 0 }}次</li>
      <li>总结过观点:{{ props.data?.summaryNum || 0 }}次</li>
    </ul>
  </el-popover>
</template>

<style lang="scss" scoped>
.group-member-item {
  position: relative;
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  &:hover {
    cursor: pointer;
    text-decoration: underline;
    color: var(--theme-color);
  }

  .icons {
    position: absolute;
    top: -20px;
    display: flex;
    gap: -5px;
  }
}

.title-text {
  font-weight: 700;
  color: var(--theme-color);
}
ul li {
  list-style: none;
}
</style>
