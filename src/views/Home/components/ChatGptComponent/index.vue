<script setup lang="ts">
import { ref } from 'vue'
import { streamChat } from '@/apis/gpt'
import { marked } from 'marked'
import 'highlight.js/styles/github.css'
import useLocalStorageMessage from './useLocalStorageMessage'
// 定义接口
interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}
const {
  getCurrentChatMessages,
  saveChatHistory,
  saveLastChatId,
  getAllMessageList,
  lastChatId,
  deleteChatHistory,
  currentChatTitle,
  setChatTitle,
  updateCurrentChatTitle,
  clearChatHistory,
} = useLocalStorageMessage()

const chatMessages = ref<ChatMessage[]>(getCurrentChatMessages())

const saveCurrentChatMessages = () => {
  if (chatMessages.value.length > 0) {
    saveChatHistory(lastChatId.value, chatMessages.value)
  }
}

const userInput = ref<string>('')
const chatHistory = ref<HTMLDivElement | null>(null)

const isReceiving = ref(false)

const sendMessage = async (): Promise<void> => {
  if (!userInput.value.trim() || isReceiving.value) return

  const newMessage: ChatMessage = {
    role: 'user',
    content: userInput.value,
    timestamp: Date.now(),
  }

  chatMessages.value.push(newMessage)

  userInput.value = ''
  scrollToBottom()

  const assistantMessage: ChatMessage = {
    role: 'assistant',
    content: '',
    timestamp: Date.now(),
  }

  chatMessages.value.push(assistantMessage)
  isReceiving.value = true

  try {
    await streamChat({
      messages: chatMessages.value,
      onMessage: (content: string) => {
        const lastMessage = chatMessages.value[chatMessages.value.length - 1]
        lastMessage.content += content
        nextTick(() => {
          scrollToBottom()
        })
      },
      onFinish: () => {
        isReceiving.value = false
        saveCurrentChatMessages()
      },
    })
  } catch (error) {
    console.error('Chat error:', error)
    isReceiving.value = false
  }
}

const createNewChat = (): void => {
  const newChatId = Date.now().toString()
  saveChatHistory(newChatId, [])
  saveLastChatId(newChatId)
  chatMessages.value = getCurrentChatMessages()
  setChatHistoryList()
}

// 清理聊天记录
const clearHistory = (): void => {
  clearChatHistory(lastChatId.value)
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
  return localStorage.getItem('userInfo')
    ? JSON.parse(localStorage.getItem('userInfo')!).nickname
    : '用户名'
}
const nickname = getNickname()

const chatHistoryList = ref<{ id: string; title: string }[]>([])
const setChatHistoryList = () => {
  chatHistoryList.value = getAllMessageList()
}
setChatHistoryList()

const selectChatHistory = (id: string) => {
  console.log('Select id:', id)
  saveLastChatId(id)
  chatMessages.value = getCurrentChatMessages()
}

const onDeleteChatHistory = (id: string) => {
  console.log('Delete id:', id)
  deleteChatHistory(id)
  setChatHistoryList()
}
const isEditChatTitle = ref(false)
const onSaveChatTitle = () => {
  setChatTitle(currentChatTitle.value, lastChatId.value)
  isEditChatTitle.value = false
  updateCurrentChatTitle()
  setChatHistoryList()
}
</script>

<template>
  <div class="chat-container">
    <!-- 交互按钮 -->
    <div class="interaction-buttons">
      <el-popover
        placement="bottom"
        trigger="hover"
        content="新对话"
        effect="dark"
      >
        <template #reference>
          <!-- 新建 -->
          <el-icon class="icon-btn" @click="createNewChat"><Plus /></el-icon>
        </template>
      </el-popover>
      <el-popover
        placement="bottom"
        trigger="hover"
        content="清空当前对话"
        effect="dark"
      >
        <template #reference>
          <!-- 清空 -->
          <el-popconfirm title="确定要清空当前对话吗？" @confirm="clearHistory">
            <template #reference>
              <el-icon class="icon-btn"><Delete /></el-icon>
            </template>
          </el-popconfirm>
        </template>
      </el-popover>
      <el-dropdown>
        <el-icon class="icon-btn"><ChatDotSquare /></el-icon>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item
              v-for="(item, index) in chatHistoryList"
              :key="index"
              :value="item.id"
              @click="selectChatHistory(item.id)"
            >
              <div class="chat-history-item">
                <span>{{ item.title }}</span>
                <el-icon
                  class="icon-btn"
                  @click.stop="onDeleteChatHistory(item.id)"
                  ><Close
                /></el-icon>
              </div>
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
    <div class="chat-title" @dblclick="() => (isEditChatTitle = true)">
      <span v-if="!isEditChatTitle">{{ currentChatTitle }}</span>
      <el-input
        v-else
        v-model="currentChatTitle"
        @blur="onSaveChatTitle"
        @keyup.enter="onSaveChatTitle"
        size="small"
      />
    </div>
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
            @click="sendMessage"
            circle
            :disabled="isReceiving"
            color="#2563eb"
            ><el-icon><Position /></el-icon
          ></el-button>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<style scoped lang="scss">
.chat-container {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 10px;
  background-color: #f5f5f5;
  --user-message-color: #95ec69;
  --assistant-message-color: #e6f4ff;
  .interaction-buttons {
    position: absolute;
    top: 10px;
    left: 10px;
    display: flex;
    justify-content: flex-start;
    margin-bottom: 20px;
    gap: 10px;
    padding: 10px;
    .icon-btn {
      font-size: 16px;
      cursor: pointer;
      background-color: white;
      border-radius: 4px;
    }
  }
  .chat-title {
    position: absolute;
    top: 10px;
    right: 30px;
    font-size: 16px;
  }
}
.chat-history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.chat-history {
  flex: 1;
  max-height: 500px;
  overflow-y: auto;
  padding: 20px;
  padding-top: 30px;
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
  // background-color: var(--assistant-message-color);
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
