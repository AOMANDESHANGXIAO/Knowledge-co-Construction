<script setup lang="ts">
interface Props {
  createdUser: string
  createdTime: string
  title: string
  id: number
}
const props = defineProps<Props>();

const emits = defineEmits(["click"]);

const handleClick = () => {
  emits("click", props.id);
}
</script>

<template>
  <section class="talk-card-container" @click="handleClick">
    <div class="title">讨论话题:</div>
    <div>{{ props.title }}</div>
    <div class="footer">
      <span>创建者: {{ props.createdUser }}</span>
      <span>创建时间: {{ props.createdTime }}</span>
    </div>
  </section>
</template>

<style scoped lang="scss">
.talk-card-container {
  position: relative;
  width: 400px;
  height: 200px;
  padding: 20px;
  background-color: var(--theme-color);
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1);
  color: #f9f9f9;
  transition: all 0.5s;
  &:hover {
    transform: scale(1.05);
    cursor: pointer;
  }

  .title {
    font-size: 20px;
    font-weight: 500;
  }

  .footer {
    position: absolute;
    bottom: 0;
    margin-bottom: 20px;
    padding-right: 30px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
  }
}
</style>
