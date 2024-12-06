<script lang="ts" setup>
import ChatGptInput from '../newChatGpt/index.vue'
import { Span } from 'naive-ui/es/legacy-grid/src/interface'
defineOptions({
  name: 'index',
})
const props = withDefaults(
  defineProps<{
    title: string
    inputValues: {
      title: string
      value: string
      placeholder: string
      tags: string[]
    }[]
    arrow: {
      text: string
      color: string
    }
    prompt: string
    colSizes?: {
      left: Span
      middle: Span
      right: Span
    }
    colShows?: {
      left: boolean
      middle: boolean
      right: boolean
    }
  }>(),
  {
    title: '编辑器',
    inputValues: () => [],
    arrow: () => ({
      text: '提交',
      color: '#2563eb',
    }),
    prompt: 'What Your reply',
    colSizes: () => ({
      left: 12,
      middle: 3,
      right: 9,
    }),
    colShows: () => ({
      left: true,
      middle: true,
      right: true,
    }),
  }
)
const arrowColor = computed(() => {
  return props.arrow.color
})
</script>

<template>
  <div class="editor-modal-layout">
    <!-- 编辑器 -->
    <section class="left">
      <header>{{ title }}</header>
      <main>
        <n-row style="height: 100%">
          <!-- 左侧编辑 -->
          <n-col
            :span="props.colSizes.left"
            style="padding: 10px; height: 100%"
            v-if="props.colShows.left"
          >
            <section class="editor-item-layout">
              <div
                class="editor-item"
                v-for="(item, index) in props.inputValues"
                :key="index"
              >
                <div class="editor-title">{{ item.title }}</div>
                <el-input
                  type="textarea"
                  :autosize="{ minRows: 2, maxRows: 6 }"
                  v-model="item.value"
                  :placeholder="item.placeholder"
                />
                <div class="tags-container">
                  <n-tag
                    type="info"
                    size="small"
                    v-for="(tag, index) in item.tags"
                    :key="index"
                    >{{ tag }}</n-tag
                  >
                </div>
              </div>
            </section>
          </n-col>
          <!-- 中间箭头 -->
          <n-col
            :span="props.colSizes.middle"
            style="height: 100%"
            v-if="props.colShows.middle"
          >
            <div class="arrow-loader-layout">
              <section>
                <div class="arrow-text">{{ props.arrow.text }}</div>
                <div class="arrow-loader"></div>
              </section>
            </div>
          </n-col>
          <!-- 右侧显示 -->
          <n-col
            :span="props.colSizes.right"
            style="height: 100%"
            v-if="props.colShows.right"
          >
            <div class="right-content-layout">
              <section class="inner-container">
                <n-text>{{ props.prompt }}</n-text>
              </section>
            </div>
          </n-col>
        </n-row>
      </main>
      <footer>
        <n-button type="info" secondary>取 消</n-button>
        <n-button type="info">发 送</n-button>
      </footer>
    </section>
    <!-- ChatGpt -->
    <section class="right">
      <div class="chatgpt-layout">
        <ChatGptInput :disabled="false"></ChatGptInput>
      </div>
    </section>
  </div>
</template>

<style lang="scss" scoped>
.editor-modal-layout {
  width: 70vw;
  height: 70vh;
  background-color: #fff;
  padding: 10px;
  display: flex;
  gap: 10px;
  --light-bgc: #f2f9ff;
  border: 1px solid #ccc;
  border-radius: 5px;
  box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.1);
  .left {
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    flex: 7;
    header {
      height: 30px;
      border-bottom: 1px solid #ccc;
      font-size: 18px;
      color: var(--theme-color);
      line-height: 30px;
      text-align: center;
      font-weight: bold;
    }
    main {
      flex: 1;
      overflow-y: auto;
      .editor-item-layout {
        display: flex;
        flex-direction: column;
        justify-content: space-around;
        gap: 10px;
        .editor-item {
          flex: 1;
          background-color: var(--light-bgc);
          padding: 5px;
          border-radius: 5px;
          .editor-title {
            font-size: 18px;
          }
          .tags-container {
            margin-top: 5px;
            display: flex;
            gap: 5px;
          }
        }
      }
      .arrow-loader-layout {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
        height: 100%;
        .arrow-text {
          text-align: center;
        }
      }
      .right-content-layout {
        height: 100%;
        padding: 10px;
        .inner-container {
          width: 100%;
          height: 100%;
          background-color: var(--light-bgc);
          border-radius: 5px;
          padding: 20px;
          display: flex;
          justify-content: center;
          align-items: center;
        }
      }
    }
    footer {
      height: 50px;
      border-top: 1px solid #ccc;
      display: flex;
      justify-content: flex-end;
      align-items: center;
      gap: 10px;
    }
  }
  .right {
    flex: 3;
    height: 100%;
    // background-color: pink;
    .chatgpt-layout {
      width: 100%;
      height: 100%;
    }
  }
}
.arrow-loader {
  width: 50px;
  height: 30px;
  display: grid;
  overflow: hidden;
}
.arrow-loader:before,
.arrow-loader:after {
  content: '';
  grid-area: 1/1;
  background: v-bind(arrowColor);
  clip-path: polygon(
    0 10px,
    calc(100% - 15px) 10px,
    calc(100% - 15px) 0,
    100% 50%,
    calc(100% - 15px) 100%,
    calc(100% - 15px) calc(100% - 10px),
    0 calc(100% - 10px)
  );
  animation: l5 1s infinite;
  transform: translate(calc(0% + var(--s, 0%)));
}
.arrow-loader:after {
  --s: -100%;
}
@keyframes l5 {
  80%,
  100% {
    transform: translate(calc(100% + var(--s, 0%)));
  }
}
</style>
