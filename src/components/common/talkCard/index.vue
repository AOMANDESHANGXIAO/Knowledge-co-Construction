<script setup lang="ts">
import { Props } from "./type.ts";

const props = defineProps<Props>();

const emits = defineEmits(["click"]);
</script>

<template>
  <section class="talk-card-container" @click="emits('click')">
    <div class="title">讨论话题:</div>
    <div>{{ props.title }}</div>
    <div class="footer">
      <span>创建者: {{ props.createdUser }}</span>
      <span>创建时间: {{ props.createdTime }}</span>
    </div>
  </section>
</template>

<style scoped lang="scss">
@import "@/styles/animation/index.scss";
.talk-card-container {
  position: relative;
  width: 400px;
  // box-sizing: content-box;
  height: 200px;
  padding: 20px;
  background-color: var(--theme-color);
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1);
  color: #f9f9f9;

  &:hover {
    animation: shake 800ms ease-in-out;
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
