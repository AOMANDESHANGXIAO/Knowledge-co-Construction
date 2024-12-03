<script lang="ts" setup>
defineOptions({
  name: 'msgNotice',
})
const props = withDefaults(
  defineProps<{
    tabBarList: Array<{
      content: string
      key: string
      num: number
    }>
    activeKey: string
    ideaList: Array<{
      nickname: string
      type: 'primary' | 'info' | 'warning' | 'success' | 'error'
      id: string
    }>
  }>(),
  {
    tabBarList: () => [],
    activeKey: '',
    ideaList: () => [],
  }
)
const emits = defineEmits(['update:activeKey', 'onChange','onClickTag'])
const onClickTabBarItem = (key: string) => {
  emits('update:activeKey', key)
  emits('onChange', key)
}
const onClickTag = (id: string) => {
  emits('onClickTag', id)
}
</script>

<template>
  <div class="msg-notice-layout">
    <n-card title="观点池(点击去回复)">
      <div class="tab-bar">
        <section
          class="tab-bar-item"
          v-for="item in tabBarList"
          :key="item.key"
          :class="{ active: item.key === activeKey }"
          @click="onClickTabBarItem(item.key)"
        >
          {{ item.content }}
          <div class="notification-badge" v-if="item.num">{{ item.num }}</div>
        </section>
      </div>
      <div class="idea-pool-container">
        <n-tag
          v-for="(item, index) in ideaList"
          @click="onClickTag(item.id)"
          :type="item.type"
          :key="index"
          style="margin-right: 5px; margin-bottom: 5px; cursor: pointer"
          >{{ item.nickname }}</n-tag
        >
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
    // height: 200px;
    padding: 10px;
    margin-top: 10px;
    border-radius: 10px;
    border: 1px solid #ccc;
  }
}
</style>
