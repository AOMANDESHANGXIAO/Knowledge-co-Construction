<script lang="ts" setup>
import { useCssVar } from '@vueuse/core'

defineOptions({
  name: 'msgNotice',
})
withDefaults(
  defineProps<{
    tabBarList: Array<{
      content: string
      key: string
      num: number
      color: string
    }>
    activeKey: string
    ideaList: Array<{
      type?: 'primary' | 'info' | 'warning' | 'success' | 'error'
      color: string
      content: string
      id: string
    }>
  }>(),
  {
    tabBarList: () => [],
    activeKey: '',
    ideaList: () => [],
  }
)
const emits = defineEmits(['update:activeKey', 'onChange', 'onClickTag'])
const el = ref<HTMLElement | null>(null)
const colorTheme = useCssVar('--color-theme', el)
const onClickTabBarItem = (key: string, color: string) => {
  colorTheme.value = color
  emits('update:activeKey', key)
  emits('onChange', key)
}
const onClickTag = (id: string) => {
  emits('onClickTag', id)
}
</script>

<template>
  <div class="msg-notice-layout" ref="el">
    <n-card title="观点池(点击去回复)">
      <div class="tab-bar">
        <section
          class="tab-bar-item"
          v-for="item in tabBarList"
          :key="item.key"
          :class="{ active: item.key === activeKey }"
          @click="onClickTabBarItem(item.key, item.color)"
        >
          {{ item.content }}
          <div class="notification-badge" v-if="item.num">{{ item.num }}</div>
        </section>
      </div>
      <div class="idea-pool-container">
        <n-tag
          v-if="ideaList.length > 0"
          v-for="(item, index) in ideaList"
          @click="onClickTag(item.id)"
          :color="{
            color: item.color,
            textColor: '#fff',
            borderColor: item.color,
          }"
          :key="index"
          style="margin-right: 5px; margin-bottom: 5px; cursor: pointer"
        >
          <n-ellipsis style="max-width: 100px">
            {{ item.content }}
          </n-ellipsis>
        </n-tag>
        <n-empty description="观点池为空~" v-else> </n-empty>
      </div>
    </n-card>
  </div>
</template>

<style lang="scss" scoped>
.msg-notice-layout {
  width: 300px;
  --color-theme: #2fa968;
  .tab-bar {
    display: flex;
    justify-content: space-between;
    width: 100%;
    // border-radius: 5px;
    // overflow: hidden;
    .tab-bar-item:first-child {
      border-radius: 5px 0 0 5px;
    }
    .tab-bar-item:last-child {
      border-radius: 0 5px 5px 0;
    }
    .tab-bar-item {
      position: relative;
      flex: 1;
      padding: 0 10px;
      box-sizing: content-box;
      height: 30px;
      line-height: 30px;
      text-align: center;
      // padding: 10px;
      border: 1px solid var(--color-theme);
      cursor: pointer;
      &.active {
        background-color: var(--color-theme);
        color: #fff;
      }
      &:hover {
        background-color: var(--color-theme);
        color: #fff;
      }
      .notification-badge {
        position: absolute;
        z-index: 10;
        right: -2px;
        bottom: -8px;
        width: 20px;
        height: 20px;
        background-color: red;
        color: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
      }
    }
  }
  .idea-pool-container {
    gap: 10px;
    width: 100%;
    max-height: 500px;
    // height: 200px;
    padding: 10px;
    margin-top: 10px;
    border-radius: 10px;
    border: 1px solid #ccc;
    overflow: auto;
  }
}
</style>
