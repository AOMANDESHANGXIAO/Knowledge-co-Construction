<script lang="ts" setup>
import { GetInteractionResponse } from '@/apis/viewpoint/interface'
import ChatGptInput from '../newChatGpt/index.vue'
import { Span } from 'naive-ui/es/legacy-grid/src/interface'
import { useStorage } from '@vueuse/core'
// import { useMessage } from 'naive-ui'
defineOptions({
  name: 'index',
})
const props = withDefaults(
  defineProps<{
    title: string
    inputValues: {
      title: string
      value: string
      key: string
      placeholder: string
      tags: string[]
      required: boolean
      setter: (value: string) => void
    }[]
    arrow: {
      text: string
      color: string
    }
    contentList: GetInteractionResponse['list']
    showContentList: boolean
    textFormatContent: string
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
    okLoading: boolean
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
    showContentList: true,
    textFormatContent: '',
    okLoading: false,
  }
)
const inputValues = ref(props.inputValues)
const arrowColor = computed(() => {
  return props.arrow.color
})
const onClickTag = (content: string, index: number) => {
  try {
    const oldValue = inputValues.value[index].value
    inputValues.value[index].setter(oldValue + content)
  } catch (error) {
    console.log(error)
  }
}
const handleOK = () => {
  const res = inputValues.value.map(item => {
    return {
      key: item.key,
      value: item.value,
      required: item.required,
    }
  })
  emits('ok', res)
}
const MIN_INPUT_LENGTH = 20
const checkShowMask = computed(() => {
  /**
   * 必须要手敲20个字符才可以使用ChatGpt
   */
  let allInput = ''
  inputValues.value.forEach(element => {
    allInput += element.value
  })
  console.log('computed input value: ', allInput, 'length: ', allInput.length)
  return !(allInput.length >= MIN_INPUT_LENGTH)
})

const emits = defineEmits(['close', 'ok'])
/**
 * 存储和ChatGpt的对话到本地
 */
const ChatMessages = useStorage(
  'chats',
  [] as {
    role: 'user' | 'assistant'
    content: string
  }[]
)
const saveChatMessage = (
  list: {
    role: 'user' | 'assistant'
    content: string
  }[]
) => {
  ChatMessages.value = list
}
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
                v-for="(item, inputValueIndex) in inputValues"
                :key="item.key"
              >
                <div class="editor-title">
                  <span v-if="item.required" style="color: red">*</span
                  ><span>{{ ' ' + item.title }}</span>
                </div>
                <el-input
                  type="textarea"
                  :autosize="{ minRows: 2, maxRows: 6 }"
                  v-model="item.value"
                  :placeholder="item.placeholder"
                  :maxlength="200"
                  show-word-limit
                />
                <div class="tags-container">
                  <n-tag
                    type="info"
                    size="small"
                    v-for="(tag, index) in item.tags"
                    :key="index"
                    @click="onClickTag(tag, inputValueIndex)"
                    style="cursor: pointer"
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
                <div
                  v-if="showContentList"
                  v-for="item in contentList"
                  style="
                    margin-bottom: 10px;
                    border-bottom: 1px solid rgb(0, 0, 0, 0.4);
                  "
                >
                  <n-h3
                    prefix="bar"
                    type="info"
                    :key="item.key"
                    style="margin-bottom: 5px"
                  >
                    <n-text>{{ item.title }}</n-text>
                  </n-h3>
                  <n-text>{{ item.value }}</n-text>
                </div>
                <div
                  v-else
                  style="
                    width: 100%;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                  "
                >
                  <n-text>{{ textFormatContent }}</n-text>
                </div>
              </section>
            </div>
          </n-col>
        </n-row>
      </main>
      <footer>
        <n-button
          type="info"
          secondary
          @click="
            () => {
              emits('close')
            }
          "
          >取 消</n-button
        >
        <n-button type="info" @click="handleOK" :loading="props.okLoading"
          >发 送</n-button
        >
      </footer>
    </section>
    <!-- ChatGpt -->
    <section class="right">
      <div class="chatgpt-layout">
        <ChatGptInput
          :init-messages="ChatMessages"
          :onUnMountedEffect="saveChatMessage"
          :disabled="false"
          :show-mask="checkShowMask"
        ></ChatGptInput>
      </div>
    </section>
  </div>
</template>

<style lang="scss" scoped>
.editor-modal-layout {
  width: var(--dialog-modal-width);
  height: var(--dialog-modal-height);
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
        justify-content: space-between;
        gap: 10px;
        height: 100%;
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
            flex-wrap: wrap;
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
          flex-direction: column;
          justify-content: center;
          // align-items: center;
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
