<script lang="ts" setup>
import icon from '../icons/index.vue'
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
  title: Title[] // 头衔
  data: Data
}

const props = defineProps<Props>()
</script>

<template>
  <el-popover placement="right" trigger="click" width="150">
    <template #reference>
      <div class="group-member-item">
        <span class="icons">
          <icon v-for="item in props.title" :iconName="item.type" />
        </span>
        <span>{{ props.name }}</span>
      </div>
    </template>
    <!-- 个人参与统计 -->
    <ul>
      <li v-for="t in props.title" :key="t.text">
        这位是:<span class="title-text"> {{ t.text }}</span> 
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
  // margin-right: 10px;
  position: relative;
  margin-top: 20px;
  &:hover {
    cursor: pointer;
    text-decoration: underline;
    color: var(--theme-color);
  }

  .icons {
    position: absolute;
    display: flex;
    left: 0;
    top: -20px;
    gap: 2px;
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
