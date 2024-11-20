<script setup lang="ts">
defineOptions({
  name: 'peerIdeaContainer',
})
withDefaults(
  defineProps<{
    name: string
    color: string
    ideaContent: string
    showEllipsis: boolean
  }>(),
  {
    color: '#000',
    ideaContent: '',
    showEllipsis: true,
  }
)
const emits = defineEmits<{
  (e: 'click'): void
}>()
const handleClick = () => {
  emits('click')
}
</script>

<template>
  <div class="peer-idea-container">
    <div class="name">
      <n-text type="info">{{ name }}</n-text>
    </div>
    <div class="idea-content" @click="handleClick">
      {{ showEllipsis ? ideaContent + '...' : ideaContent }}
    </div>
  </div>
</template>

<style scoped lang="scss">
.peer-idea-container {
  width: 100%;
  // height: 30px;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  margin-top: 10px;
  margin-bottom: 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid #ccc;
  .name {
    display: flex;
    align-items: center;
    font-size: 14px;
    text-align: center;
    line-height: 30px;
    min-width: 50px;
    // padding-left: 5px;
    &::before {
      content: '';
      display: inline-block;
      margin-right: 5px;
      width: 5px;
      height: 30px;
      background-color: v-bind(color);
    }
  }
}
</style>
