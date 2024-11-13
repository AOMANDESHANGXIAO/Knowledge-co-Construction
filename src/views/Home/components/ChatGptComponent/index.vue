<script setup lang="ts">
import { ref } from 'vue'
import { streamChat } from '@/apis/gpt'
import { marked } from 'marked'
import 'highlight.js/styles/github.css'
// 定义接口
interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

interface QuestionScaffold {
  title: string
  template: string
}

const chatMessages = ref<ChatMessage[]>([])

const userInput = ref<string>('')
const chatHistory = ref<HTMLDivElement | null>(null)

const questionScaffolds: QuestionScaffold[] = [
  {
    title: '代码解释',
    template: '请解释以下代码的功能：\n```\n\n```',
  },
  {
    title: '代码优化',
    template: '请帮我优化以下代码：\n```\n\n```',
  },
  {
    title: '错误诊断',
    template: '我遇到了以下错误，请帮我解决：\n错误信息：\n代码：\n',
  },
  {
    title: '功能实现',
    template: '我想实现以下功能：\n具体要求：\n',
  },
]

// 添加函数类型
const useScaffold = (scaffold: QuestionScaffold): void => {
  userInput.value = scaffold.template
}
const isReceiving = ref(false)
const sendMessage = async (): Promise<void> => {
  if (!userInput.value.trim()) return

  // 添加用户消息
  chatMessages.value.push({
    role: 'user',
    content: userInput.value,
  })

  // 清空输入并滚动到底部
  userInput.value = ''
  scrollToBottom()

  // 添加一个空的助手消息
  const assistantMessage: ChatMessage = {
    role: 'assistant',
    content: '',
  }
  chatMessages.value.push(assistantMessage)
  isReceiving.value = true
  streamChat({
    messages: chatMessages.value,
    onMessage: (content: string) => {
      const lastMessage =
        chatMessages.value[chatMessages.value.length - 1].content
      chatMessages.value[chatMessages.value.length - 1].content =
        lastMessage + content
      nextTick(() => {
        scrollToBottom()
      })
    },
    onFinish: () => {
      isReceiving.value = false
    },
  })
}

const clearHistory = (): void => {
  chatMessages.value = []
}

const scrollToBottom = (): void => {
  setTimeout(() => {
    if (chatHistory.value) {
      chatHistory.value.scrollTop = chatHistory.value.scrollHeight
    }
  }, 100)
}

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
const getNickname = () => {
  return  localStorage.getItem('userInfo')
    ? JSON.parse(localStorage.getItem('userInfo')!).nickname
    : '用户名'
}
const nickname = getNickname()
</script>

<template>
  <div class="chat-container">
    <!-- 聊天历史记录 -->
    <div class="chat-history" ref="chatHistory">
      <!-- 聊天记录 -->
      <div
        v-for="(message, index) in chatMessages"
        :key="index"
        :class="[
          'message',
          message.role === 'assistant' ? 'assistant' : 'user',
        ]"
      >
        <div
          class="message-content"
          v-html="formatMessage(message.content)"
        ></div>
      </div>
      <!-- 空消息 -->
      <div class="empty-message" v-if="chatMessages.length === 0">
        <div class="empty-message-content">
          <p>Hey, {{ nickname }}</p>
          <p>让我们一起完成论证!</p>
        </div>
      </div>
    </div>
    <!-- 输入区域 -->
    <div class="input-area">
      <el-row :gutter="10">
        <el-col :span="20">
          <el-input
            v-model="userInput"
            placeholder="请输入您的问题..."
            @keyup.enter="sendMessage"
            type="textarea"
            :rows="2"
            :autosize="{ minRows: 2, maxRows: 6 }"
            :disabled="isReceiving"
          />
        </el-col>
        <el-col :span="4">
          <el-button
            type="primary"
            @click="sendMessage"
            circle
            :disabled="isReceiving"
            ><el-icon><Position /></el-icon
          ></el-button>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<style scoped lang="scss">
.chat-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 10px;
  background-color: #f5f5f5;
  --user-message-color: #95ec69;
  --assistant-message-color: #e6f4ff;
}

.chat-history {
  flex: 1;
  max-height: 500px;
  overflow-y: auto;
  padding: 20px;
  background-color: white;
  border-radius: 8px;
  margin-bottom: 20px;
}

.message {
  display: flex;
  margin-bottom: 20px;
  width: 100%;
}

.user {
  justify-content: flex-end;
}

.assistant {
  justify-content: flex-start;
}

.message-content {
  background-color: var(--assistant-message-color);
  padding: 12px;
  border-radius: 8px;
  max-width: 90%;
}
.empty-message {
  .empty-message-content {
    p {
      font-size: 18px;
    }
  }
}

.user .message-content {
  background-color: var(--user-message-color);
  /* color: #fff; */
}

.question-scaffolds {
  margin-bottom: 20px;
}

.scaffold-buttons {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.scaffold-buttons button {
  padding: 8px 16px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background-color: white;
  cursor: pointer;
  transition: all 0.3s;
}

.scaffold-buttons button:hover {
  background-color: #e6f4ff;
  border-color: #1890ff;
}

.input-area {
  background-color: white;
  padding: 10px;
  border-radius: 8px;
}

textarea {
  width: 100%;
  height: 100px;
  padding: 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  resize: none;
  margin-bottom: 12px;
}

.button-group {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

button:not(.clear-btn) {
  background-color: #1890ff;
  color: white;
}

.clear-btn {
  background-color: #ff4d4f;
  color: white;
}

button:hover:not(:disabled) {
  opacity: 0.8;
}
</style>
