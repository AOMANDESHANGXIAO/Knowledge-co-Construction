<script setup lang="ts">
import { Props } from "./type.ts";
import { IconName } from "@/components/Icons/analysisItemIcon/type.ts";
import analysisItemIcon from "@/components/Icons/analysisItemIcon/index.vue";
import CountUp from "vue-countup-v3";

const props = withDefaults(defineProps<Props>(), {
  iconName: IconName.discussion,
  text: "参与了讨论",
  num: 180,
});
</script>

<template>
  <div class="analysis-item-container">
    <section class="icon">
      <analysis-item-icon :name="props.iconName"></analysis-item-icon>
    </section>
    <section class="text">{{ props.text }}</section>
    <section class="number">
      <span
        ><count-up :end-val="props.num" :duration="2.5">
          <template #suffix><span>次</span></template>
        </count-up></span
      >
    </section>
  </div>
</template>

<style scoped lang="scss">
@import "@/styles/mixin/layout.scss";
@import "@/styles/mixin/size.scss";

.analysis-item-container {
  @include flex-center;
  flex-direction: column;
  gap: 10px;
  @include square-card;
  background-color: var(--theme-color);
  color: #f9f9f9;
  transition: all 0.5s;

  &:hover {
    cursor: pointer;
    transform: scale(1.1);
  }

  .icon {
    @include flex-center;
    width: 50px;
    height: 50px;
    border-radius: 15px;
    transform: scale(2);
  }

  .number {
    font-size: 36px;
    font-weight: 300;
    border-bottom: 1px solid #fff;
  }
}
</style>
