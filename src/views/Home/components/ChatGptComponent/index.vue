<script setup lang="ts">
import { ref } from 'vue'
import { streamChat } from '@/apis/gpt'
import { marked } from 'marked'
import 'highlight.js/styles/github.css'
import useLocalStorageMessage from './useLocalStorageMessage'
import useQueryParam from '@/hooks/useQueryParam.ts'
import { useUserStore } from '@/store/useUserStore.ts'
import Icon from './icon.vue'
import { useClipboard } from '@vueuse/core'
import type { NodeType, EdgeType } from '../ArgumentFlowComponent/type'
import { ArgumentType } from '../ArgumentFlowComponent/type'
import type { Scaffold } from './chatgptComponent.type'
import { THEME_COLOR } from '@/config'
const props = withDefaults(
  defineProps<{
    // 话题
    topic: string
    // 当前的论证
    currentArgument: string
    getArgumentState: () => {
      nodes: NodeType[]
      edges: EdgeType[]
      [key: string]: any
    }
    nodes: NodeType[]
    edges: EdgeType[]
    scaffold: Scaffold[]
  }>(),
  {
    topic: '',
    currentArgument: '',
    getArgumentState: () => ({
      nodes: [],
      edges: [],
    }),
    nodes: () => [] as NodeType[],
    edges: () => [] as EdgeType[],
  }
)

// 定义接口
interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  showContent: string
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
// 准备参数
const { getOneUserInfo } = useUserStore()
const studentId = computed(() => {
  return getOneUserInfo('id')
})
const topicId = useQueryParam('topic_id')
const newMessageParam = ref<string>('')
const getParams = () => {
  return {
    student_id: studentId.value as string,
    topic_id: topicId.value as string,
    new_message: newMessageParam.value,
  }
}
const createNewMessage = ({
  content,
  role = 'user',
  showContent,
}: {
  content: string
  role?: 'user' | 'assistant'
  showContent?: string
}): ChatMessage => {
  return {
    role,
    content,
    showContent: showContent || content,
    timestamp: Date.now(),
  }
}
const checkCanSendMessage = () => {
  return userInput.value.trim() !== '' && !isReceiving.value
}
const pushNewMessageFromUserInputToChatMessages = () => {
  // 创建来自用户的新消息
  const newMessage = createNewMessage({
    content: userInput.value,
  })
  chatMessages.value.push(newMessage)
  newMessageParam.value = userInput.value
  userInput.value = ''
  // scrollToBottom()
  // 创建来自助手的空消息
  const assistantMessage = createNewMessage({
    role: 'assistant',
    content: '',
    showContent: '',
  })
  chatMessages.value.push(assistantMessage)
}
const sendMessage = async ({
  pushNewMsg,
}: {
  pushNewMsg: () => void
}): Promise<void> => {
  if (!checkCanSendMessage()) return
  pushNewMsg()
  try {
    await streamChat({
      messages: chatMessages.value,
      getParams: () => {
        console.log('getParams', getParams())
        return getParams()
      },
      onMessage: (content: string) => {
        const lastMessage = chatMessages.value[chatMessages.value.length - 1]
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
/**
 * 将论点格式化后返回
 */
const argumentTypeChinese = {
  [ArgumentType.Claim]: '论点',
  [ArgumentType.Data]: '论据',
  [ArgumentType.Warrant]: '辩护',
  [ArgumentType.Rebuttal]: '反驳',
  [ArgumentType.Backing]: '支持',
  [ArgumentType.Qualifier]: '限定词',
}
const getFormattedNodes = (): string => {
  return props.nodes
    .map(node => {
      return `${argumentTypeChinese[node._type]}: ${node.data.inputValue}`
    })
    .join('\n')
}
/**
 * 检查props.nodes和props.edges的情况，只有nodes和edges中包含
 * 前提、结论、辩护时才可以发送消息
 */
const checkNodesAndEdges = (
  conditions: {
    nodeType: NodeType['_type']
    minWordCount: number
  }[]
) => {
  let count = 0
  for (const condition of conditions) {
    const findNode = props.nodes.find(node => node._type === condition.nodeType)
    // console.log('findNode', findNode)
    if (findNode && findNode.data.inputValue.length >= condition.minWordCount) {
      count++
    }
  }
  return count === conditions.length
}
const canSendMessage = computed(() => {
  return checkNodesAndEdges([
    { nodeType: ArgumentType.Claim, minWordCount: 10 },
    { nodeType: ArgumentType.Data, minWordCount: 10 },
  ])
})
watch(
  () => canSendMessage.value,
  (newValue, oldValue) => {
    if (newValue !== oldValue && oldValue === false && newValue === true) {
      ElNotification({
        title: '提示',
        message: '论证助手已解锁!你可以开始对话了!',
        type: 'success',
        duration: 3000,
      })
    }
  }
)

// 快速提示
const trimmedTopic = computed(() => {
  return props.topic.trim()
})

const onClickScaffoldItem = (scaffold: Scaffold) => {
  if (scaffold.validate()) {
    userInput.value = scaffold.getPrompt()
    sendMessage({ pushNewMsg: pushNewMessageFromUserInputToChatMessages })
  } else {
    scaffold.onValidateError()
  }
}
const { copy } = useClipboard()
const onClickCopy = (message: ChatMessage) => {
  try {
    copy(message.content)
    ElMessage.success('复制成功')
  } catch (error) {
    ElMessage.error('复制失败')
  }
}
const onClickRefresh = (index: number) => {
  const originalPrompt = chatMessages.value[index - 1]?.content
  chatMessages.value = chatMessages.value.filter(
    (_, i) => i !== index && i !== index - 1
  )
  nextTick(() => {
    userInput.value = originalPrompt
    sendMessage({ pushNewMsg: pushNewMessageFromUserInputToChatMessages })
  })
}
const onClickDisagree = (message: ChatMessage) => {
  const disagreeUserInput = `我不同意你的这一观点,即"""${message.content}"""。我不同意的证据是: 1. 2. 3. `
  userInput.value = disagreeUserInput
}

const currentQuestionTemplate = ref('')
const options = ref([
  {
    label: '论证结构问题',
    value: 'argumentation',
    getPrompt: () => {
      return `请分析我的论证结构是否存在问题。这是讨论的话题:${
        trimmedTopic.value
      }。这是我的论证:${getFormattedNodes()}`
    },
  },
  {
    label: '辩护逻辑合理性',
    value: 'defense',
    getPrompt: () => {
      return `请分析我的论证辩护逻辑是否合理。这是讨论的话题:${
        trimmedTopic.value
      }。这是我的论证:${getFormattedNodes()}`
    },
  },
  {
    label: '论证支撑合理性',
    value: 'evidence',
    getPrompt: () => {
      return `请评估我的论证辩护的支撑是否合理充分。这是讨论的话题:${
        trimmedTopic.value
      }。这是我的论证:${getFormattedNodes()}`
    },
  },
  {
    label: '论证局限性',
    value: 'limitation',
    getPrompt: () => {
      return `请分析我的论证可能存在的局限性。这是讨论的话题:${
        trimmedTopic.value
      }。这是我的论证:${getFormattedNodes()}`
    },
  },
  {
    label: '论证完整性',
    value: 'problemSelf',
    getPrompt: () => {
      return `请全面检查我的论证是否完整。这是讨论的话题:${
        trimmedTopic.value
      }。这是我的论证:${getFormattedNodes()}`
    },
  },
  {
    label: '插入论证',
    value: 'insertClaim',
    getPrompt: () => {
      return `${getFormattedNodes()}`
    },
  },
  {
    label: '插入话题',
    value: 'insertTopic',
    getPrompt: () => {
      return `${trimmedTopic.value}`
    },
  },
])
const onClickQuestionTemplate = () => {
  if (!currentQuestionTemplate.value) {
    ElMessage.error('请先选择提问模板')
    return
  }
  const selectedOption = options.value.find(
    option => option.value === currentQuestionTemplate.value
  )
  if (selectedOption) {
    userInput.value += selectedOption.getPrompt()
  }
}
const onClickNotAllowMask = () => {
  ElNotification({
    title: '提示',
    message: '构建一个包含前提和结论元素的论证以解锁,每个元素不少于10个字',
    duration: 5000,
    type: 'warning',
  })
}
</script>

<template>
  <div class="chat-container">
    <div class="header-bar">
      <div class="left">
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
              <el-icon class="icon-btn" @click="createNewChat"
                ><Plus
              /></el-icon>
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
              <el-popconfirm
                title="确定要清空当前对话吗？"
                @confirm="clearHistory"
              >
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
      </div>
      <div class="right">
        <!-- 聊天标题 -->
        <div class="chat-title" @dblclick="() => (isEditChatTitle = true)">
          <span v-if="!isEditChatTitle">{{ currentChatTitle }}</span>
          <el-input
            v-else
            v-model="currentChatTitle"
            @blur="onSaveChatTitle"
            @keyup.enter="onSaveChatTitle"
          />
        </div>
      </div>
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
          v-if="message.role === 'assistant'"
          class="message-content"
          v-html="formatMessage(message.content)"
        ></div>
        <div v-else class="message-content">{{ message.content }}</div>
        <div class="icon-btn" v-if="message.role === 'assistant'">
          <Icon name="copy" :size="16" @click="onClickCopy(message)" />
          <Icon name="refresh" :size="16" @click="onClickRefresh(index)" />
          <Icon name="disagree" :size="16" @click="onClickDisagree(message)" />
        </div>
      </div>
      <!-- 空消息时不会显示 -->
      <el-divider content-position="center" v-if="chatMessages.length > 0">
        <span style="font-size: 8px">请仔细甄别</span>
      </el-divider>
      <!-- 空消息 -->
      <div class="empty-message" v-if="chatMessages.length === 0">
        <div class="empty-message-content">
          <p>Hey, {{ nickname }}</p>
          <p>让我们一起完成论证!</p>
        </div>
        <!-- 空消息时会给快速提示 -->
        <div class="question-scaffolds">
          <div class="card-container" v-for="scaffold in props.scaffold">
            <n-card
              :key="scaffold.key"
              :title="scaffold.title"
              size="small"
              hoverable
              embedded
              :bordered="false"
              @click="onClickScaffoldItem(scaffold)"
            >
              <n-text>{{ scaffold.description }}</n-text>
            </n-card>
            <!-- 蒙版，如果不能发送信息则显示 -->
            <div
              class="mask"
              v-if="!canSendMessage"
              @click="onClickNotAllowMask"
            >
              <n-text type="primary" style="font-size: 18px"
                >继续构建论证以解锁</n-text
              >
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- 插入提问模板的地方 -->
    <div class="question-template">
      <el-row :gutter="10">
        <el-col :span="16">
          <el-select
            v-model="currentQuestionTemplate"
            placeholder="请选择提问模板"
          >
            <el-option
              v-for="item in options"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-col>
        <el-col :span="4">
          <el-button
            :color="THEME_COLOR"
            @click="onClickQuestionTemplate"
            :disabled="isReceiving || !canSendMessage"
            >插入</el-button
          >
        </el-col>
      </el-row>
    </div>
    <!-- 输入区域 -->
    <div class="input-area">
      <el-row :gutter="10">
        <el-col :span="20">
          <el-input
            v-model="userInput"
            placeholder="和我一起论证吧..."
            @keyup.enter="
              () =>
                sendMessage({
                  pushNewMsg: pushNewMessageFromUserInputToChatMessages,
                })
            "
            type="textarea"
            :rows="2"
            :autosize="{ minRows: 2, maxRows: 6 }"
            :disabled="isReceiving || !canSendMessage"
            clearable
          />
        </el-col>
        <el-col :span="4">
          <el-button
            @click="
              () => {
                sendMessage({
                  pushNewMsg: pushNewMessageFromUserInputToChatMessages,
                })
              }
            "
            circle
            :disabled="isReceiving || !canSendMessage"
            :color="THEME_COLOR"
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
  --user-message-color: v-bind(THEME_COLOR);
  --assistant-message-color: #e6f4ff;
  overflow: hidden;
  .header-bar {
    position: absolute;
    top: 10px;
    // left: 0;
    display: flex;
    justify-content: space-between;
    width: calc(100% - 20px);
    // height: 30px;
    padding: 10px;
    background-color: #fff;
    // background-color: white;
    border-radius: 8px 8px 0 0;
    // z-index: 10;
  }
  .interaction-buttons {
    display: flex;
    justify-content: flex-start;
    // margin-bottom: 20px;
    gap: 10px;
    // padding: 10px;
    .icon-btn {
      font-size: 16px;
      cursor: pointer;
      background-color: white;
      border-radius: 4px;
    }
  }
  .chat-title {
    font-size: 16px;
    text-decoration: underline;
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
  padding-top: 40px;
  margin-bottom: 20px;
  background-color: white;
  border-radius: 8px;
  .icon-btn {
    display: flex;
    gap: 10px;
    background-color: white;
    padding: 10px;
    // border-radius: 4px;
  }
}

.message {
  display: flex;
  flex-direction: column;
  margin-bottom: 20px;
  width: 100%;
}

.user {
  justify-content: flex-end;
  color: #fff;
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
  .question-scaffolds {
    width: 100%;
    padding: 10px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    :deep(.n-card) {
      cursor: pointer;
    }
    .card-container {
      position: relative;
    }
    .mask {
      position: absolute;
      top: 0;
      left: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      width: 100%;
      height: 100%;
      background-color: rgba(255, 255, 255, 0.5);
      z-index: 100;
      cursor: not-allowed;
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
  position: relative;
  background-color: white;
  padding: 10px;
  border-radius: 8px;
  .mask {
    z-index: 100;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #fff;
    .mask-content {
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      transform: scale(0.8);
    }
  }
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

// button {
//   padding: 8px 16px;
//   border: none;
//   border-radius: 4px;
//   cursor: pointer;
//   transition: all 0.3s;
// }

// button:disabled {
//   opacity: 0.5;
//   cursor: not-allowed;
// }

// button:not(.clear-btn) {
//   background-color: #1890ff;
//   color: white;
// }

// .clear-btn {
//   background-color: #ff4d4f;
//   color: white;
// }

// button:hover:not(:disabled) {
//   opacity: 0.8;
// }
.question-template {
  // padding: 10px;
  // background-color: #1890ff;
  border-radius: 8px;
  width: 100%;
  // height: 50px;
  margin-bottom: 20px;
}
</style>
