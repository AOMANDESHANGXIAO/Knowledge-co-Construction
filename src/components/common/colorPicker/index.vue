<script setup lang="ts">
import Icon from '@/components/Icons/ManagePageIcon/index.vue'
import {Name} from "@/components/Icons/ManagePageIcon/type.ts";

defineProps({
  selectedColor: {
    type: String,
    default: ''
  },
})


const colorList = ref<string[]>(['#604CC3', '#FF7F3E', '#219C90', '#FF0080', '#59D5E0', '#7FC7D9'])

const selectedIndex = ref<number>(-1)

const selectItem = ref<string>('')

const emits = defineEmits(['update:selectedColor'])

const handleSelect = (index: number) => {
  selectedIndex.value = index
  selectItem.value = colorList.value[index]
  emits('update:selectedColor', selectItem.value)
}

</script>

<template>
  <section class="my-color-picker">
    <div class="item" v-for="(item, index) in colorList" :key="index" :style="{ background: item }"
         @click="handleSelect(index)">
      <Icon :name="Name.Select" v-if="selectedIndex === index" class="selectable-icon"></Icon>
    </div>
  </section>
</template>

<style scoped lang="scss">
.my-color-picker {

  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 10px;
  width: 100%;
  height: 100%;

  .selectable-icon {
    position: absolute;
    top: 0;
  }

  .item {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 30px;
    height: 30px;
    border-radius: 5px;
    transition: all .2s;
    cursor: pointer;

    &:hover {
      transform: scale(1.2);
    }
  }
}
</style>