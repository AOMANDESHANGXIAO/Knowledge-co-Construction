<script lang="ts" setup>
import { streamChat } from '@/apis/gpt'
import useQueryParam from '@/hooks/router/useQueryParam'
import { useUserStore } from '@/store/modules/user'
import { marked } from 'marked'
import { TrashBinOutline } from '@vicons/ionicons5'
defineOptions({
  name: 'index',
})

const props = withDefaults(
  defineProps<{
    disabled: boolean
  }>(),
  {
    disabled: false,
  }
)
// 配置 marked
marked.setOptions({})
const formatMessage = (content: string): string => {
  try {
    return marked(content) as string
  } catch (e) {
    console.error('Markdown parsing error:', e)
    return content
  }
}
interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}
const messages = ref<ChatMessage[]>([])
const input = ref('')
const isReceiving = ref(false)
const pushMsg = () => {
  const newMsg: ChatMessage = {
    role: 'user',
    content: input.value,
  }
  messages.value.push(newMsg)
  const newAssistantMsg: ChatMessage = {
    role: 'assistant',
    content: '',
  }
  messages.value.push(newAssistantMsg)
}
// 准备参数
const { getOneUserInfo } = useUserStore()
const studentId = computed(() => {
  return getOneUserInfo('id')
})
const topicId = useQueryParam('topic_id')
const getParams = () => {
  return {
    student_id: studentId.value as string,
    topic_id: topicId.value as string,
    new_message: input.value,
  }
}
const scrollToBottom = () => {
  const dom = document.querySelector('#chat-window')
  if (dom) {
    dom.scrollTo(0, dom.scrollHeight)
  }
}
const sendMessage = async (): Promise<void> => {
  pushMsg()
  try {
    await streamChat({
      messages: messages.value,
      getParams: () => {
        return getParams()
      },
      onMessage: (content: string) => {
        const lastMessage = messages.value[messages.value.length - 1]
        lastMessage.content += content
        nextTick(() => {
          scrollToBottom()
        })
      },
      onStart: () => {
        isReceiving.value = true
      },
      onFinish: () => {
        isReceiving.value = false
      },
    })
  } catch (error) {
    console.error('Chat error:', error)
    isReceiving.value = false
  }
}
const validator = () => {
  if (input.value.trim() === '') {
    return false
  }
  return true
}
const onClickBtn = () => {
  if (validator()) {
    sendMessage()
    input.value = ''
  }
}
const isSendingDisabled = computed(() => {
  return props.disabled || isReceiving.value
})
const clear = () => {
  messages.value = []
}
</script>

<template>
  <div class="card">
    <div class="chat-header">
      <div>ChatGpt</div>
      <div class="icon" @click="clear">
        <n-icon><TrashBinOutline /></n-icon>
      </div>
    </div>
    <div class="chat-window" id="chat-window">
      <ul class="message-list">
        <section
          v-for="(item, index) in messages"
          :class="item.role"
          :key="index"
        >
          <div
            class="inner"
            v-if="item.role === 'assistant'"
            v-html="formatMessage(item.content)"
          ></div>
          <div class="inner" v-else>
            {{ item.content }}
          </div>
        </section>
      </ul>
    </div>
    <div class="chat-input">
      <input
        v-model="input"
        type="textarea"
        class="message-input"
        placeholder="和我交流吧..."
        :disabled="isSendingDisabled"
        @keyup.enter="onClickBtn"
      />
      <button
        :class="{ disabled: isSendingDisabled }"
        class="send-button"
        @click="onClickBtn"
        :disabled="isSendingDisabled"
      >
        发 送
      </button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
/* From Uiverse.io by ahmed150up */
.card {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background-color: #fff;
  border: 1px solid #ccc;
  border-radius: 5px;
  box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.1);
}

.chat-header {
  background-color: var(--theme-color);
  color: #fff;
  padding: 10px;
  font-size: 18px;
  border-top-left-radius: 5px;
  border-top-right-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  .icon {
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
  }
}

.chat-window {
  // height: 220px;
  flex: 1;
  overflow-y: scroll;
}

.message-list {
  list-style: none;
  margin: 0;
  padding: 0;
  --msg-font-size: 14px;
  --msg-padding: 10px;
  .assistant,
  .user {
    display: flex;
  }
  .user {
    justify-content: flex-end;
    padding: var(--msg-padding);
    font-size: var(--msg-font-size);
    .inner {
      max-width: 70%;
      border-radius: 5px;
      padding: 5px 10px;
      background-color: var(--theme-color);
      color: #fff;
    }
  }
  .assistant {
    justify-content: flex-start;
    padding: var(--msg-padding);
    font-size: var(--msg-font-size);
    .inner {
      max-width: 70%;
      padding: 5px 10px;
      color: var(--dark-color);
    }
  }
}

.chat-input {
  display: flex;
  align-items: center;
  padding: 10px;
  border-top: 1px solid #ccc;
}

.message-input {
  flex: 1;
  border: none;
  outline: none;
  padding: 5px;
  font-size: 14px;
}

.send-button {
  border: none;
  outline: none;
  background-color: var(--theme-color);
  color: #fff;
  font-size: 14px;
  padding: 5px 10px;
  cursor: pointer;
}
.disabled {
  background-color: #ccc; /* 灰色背景 */
  color: #666; /* 灰色文字 */
  cursor: not-allowed; /* 禁用光标 */
  opacity: 0.6; /* 透明度 */
}
.send-button:hover:not(.disabled) {
  background-color: rgb(255, 255, 255);
  color: rgb(0, 0, 0);
  box-shadow: 0 4px 18px 0 rgba(0, 0, 0, 0.25);
}
</style>
