<script lang="ts" setup>
defineOptions({
  name: 'index',
})
const props = defineProps({
  isShow: {
    type: Boolean,
    default: false,
  },
  offsetWidth: {
    type: Number,
    default: 0,
  },
  offsetHeight: {
    type: Number,
    default: 50,
  },
  width: {
    type: Number,
    default: 200,
  },
})
</script>

<template>
  <transition name="fade">
    <section
      v-if="props.isShow"
      class="content-container"
      :style="{
        left: `calc(${props.offsetWidth}px + 10px)`,
        width: `${props.width}px`,
        transform: `translateY(calc(-50% + ${props.offsetHeight}px / 2))`,
      }"
    >
      <slot></slot>
    </section>
  </transition>
</template>

<style lang="scss" scoped>
.content-container {
  position: absolute;
  top: 0;
  min-width: 200px;
  max-width: 500px;
  min-height: 100px;
  max-height: 500px;
  padding: 10px;
  border-radius: 4px;
  background-color: #fff;
  color: #242424;
  font-size: 12px;
  box-shadow: 0px 0px 12px rgba(0, 0, 0, 0.12);
  z-index: 999; // 保证显示在最上层
  &::after {
    content: '';
    display: block;
    position: absolute;
    top: 50%;
    left: 0;
    width: 20px;
    height: 20px;
    transform: translateY(-10px) rotate(45deg);
    background-color: #fff;
    z-index: -10;
  }
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
