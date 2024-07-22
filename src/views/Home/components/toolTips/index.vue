<script lang="ts" setup>
import { useElementSize } from '@vueuse/core'
defineOptions({
  name: 'tips',
})
const props = defineProps<{
  value: string
  defaultValue: string
}>()

const el = ref<HTMLElement | null>(null)
const { height } = useElementSize(el)
const topOffset = ref(50)

watch(height, () => {
  topOffset.value = height.value
})
</script>

<template>
  <transition name="fade">
    <section class="tooltips" ref="el" :style="`top:-${topOffset + 30}px`">
      {{ props.value || props.defaultValue || 'There is no default value' }}
    </section>
  </transition>
</template>

<style lang="scss" scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.tooltips {
  position: absolute;
  // top: -60px;
  left: 0;
  min-width: 100%;
  min-height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px;
  font-size: 10px;
  color: #fff;
  background-color: rgba(0, 0, 0, 0.5);
  &::after {
    // 绘制向下居中的三角形
    content: '';
    position: absolute;
    bottom: -5px;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 5px solid transparent;
    border-right: 5px solid transparent;
    border-top: 5px solid rgba(0, 0, 0, 0.5);
  }
}
</style>
