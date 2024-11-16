<script setup lang="ts">
import { ref } from 'vue'
import { streamChat } from '@/apis/gpt'
import { marked } from 'marked'
import 'highlight.js/styles/github.css'
import useLocalStorageMessage from './useLocalStorageMessage'
import useQueryParam from '@/hooks/router/useQueryParam'
import { useUserStore } from '@/store/modules/user'
import Icon from './icon.vue'
import { useClipboard } from '@vueuse/core'
import type { NodeType, EdgeType } from '../ArgumentFlowComponent/type'
import { ArgumentType } from '../ArgumentFlowComponent/type'
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
const getParams = () => {
  return {
    student_id: studentId.value as string,
    topic_id: topicId.value as string,
    new_message: userInput.value,
  }
}
const sendMessage = async (): Promise<void> => {
  if (!userInput.value.trim() || isReceiving.value) return

  const newMessage: ChatMessage = {
    role: 'user',
    content: userInput.value,
    timestamp: Date.now(),
  }

  chatMessages.value.push(newMessage)
  // 获取请求参数
  const params = getParams()
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
      params,
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
    console.log('findNode', findNode)
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
    { nodeType: ArgumentType.Warrant, minWordCount: 10 },
  ])
})
// 快速提示
interface Scaffold {
  title: string
  description: string
  getPrompt: (...args: any[]) => string
  ShowInQuickPrompt: boolean
  key: 'argumentation' | 'defense' | 'limitation' | 'evidence'
  validate: (...args: any[]) => boolean
  onValidateError: () => void
}
const trimmedTopic = computed(() => {
  return props.topic.trim()
})
const validateTopic = () => {
  return props.topic.trim() !== ''
}
// 给ChatGpt的提示词支架
const scaffolds = ref<Scaffold[]>([
  {
    title: '论证框架',
    description: '分析我的论证框架。',
    key: 'argumentation',
    getPrompt: () => {
      return `请你帮我分析我的论证,给出论证的基础、结论、论据以及论证的局限之处。\
        请用中文回答。这是我正在论证的话题：${
          trimmedTopic.value
        }。这是我的论证：${getFormattedNodes()}`
    },
    ShowInQuickPrompt: true,
    validate: () => {
      return (
        validateTopic() &&
        getFormattedNodes().length > 0 &&
        canSendMessage.value
      )
    },
    onValidateError: () => {
      ElMessage.error('请先输入话题和论证和辩护')
    },
  },
  {
    title: '辩护审查',
    description: '审查论证的辩护。',
    key: 'defense',
    getPrompt: () => {
      return `请你帮我审查一下论证的辩护，请用中文回答。这是我目前的论证：${getFormattedNodes()}`
    },
    ShowInQuickPrompt: true,
    validate: () => {
      return getFormattedNodes().length > 0 && canSendMessage.value
    },
    onValidateError: () => {
      ElMessage.error('请先输入话题和辩护')
    },
  },
  {
    title: '局限检验',
    description: '分析论证的局限性。',
    key: 'limitation',
    getPrompt: () => {
      return `请你帮我分析一下论证的局限性，请用中文回答。这是我目前的论证：${getFormattedNodes()}`
    },
    ShowInQuickPrompt: true,
    validate: () => {
      return (
        getFormattedNodes().length > 0 &&
        checkNodesAndEdges([
          { nodeType: ArgumentType.Qualifier, minWordCount: 2 },
          {
            nodeType: ArgumentType.Rebuttal,
            minWordCount: 10,
          },
        ])
      )
    },
    onValidateError: () => {
      ElMessage.error('请先输入话题论证的反驳')
    },
  },
  {
    title: '证据审查',
    description: '审查论证的证据。',
    key: 'evidence',
    getPrompt: () => {
      return `请你帮我审查一下论证的证据，请用中文回答。这是我目前的论证：${getFormattedNodes()}`
    },
    ShowInQuickPrompt: true,
    validate: () => {
      return (
        getFormattedNodes().length > 0 &&
        checkNodesAndEdges([
          { nodeType: ArgumentType.Backing, minWordCount: 10 },
        ])
      )
    },
    onValidateError: () => {
      ElMessage.error('请先输入话题和论证的支持')
    },
  },
])

const showScaffoldsList = computed(() => {
  return scaffolds.value.filter(item => {
    return item.ShowInQuickPrompt
  })
})
const onClickScaffoldItem = (scaffold: Scaffold) => {
  if (scaffold.validate()) {
    userInput.value = scaffold.getPrompt()
    sendMessage()
  } else {
    ElMessage.error('请先输入话题和论证')
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
const onClickRefresh = (message: ChatMessage, index: number) => {
  // 重新生成，也就是重新发送请求
  const originalPrompt = chatMessages.value[index - 1]?.content
  // 删除当前的assistant消息和user消息
  chatMessages.value = chatMessages.value.filter(
    (_, i) => i !== index && i !== index - 1
  )
  nextTick(() => {
    userInput.value = originalPrompt
    sendMessage()
  })
}
const onClickDisagree = (message: ChatMessage) => {
  // console.log('点击不同意')
  // 生成一个不同意的模板。
  const disagreeUserInput = `我不同意你的这一观点,即"""${message.content}"""。我不同意的证据是: 1. 2. 3. `
  userInput.value = disagreeUserInput
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
          class="message-content"
          v-html="formatMessage(message.content)"
        ></div>
        <div class="icon-btn" v-if="message.role === 'assistant'">
          <Icon name="copy" :size="16" @click="onClickCopy(message)" />
          <Icon
            name="refresh"
            :size="16"
            @click="onClickRefresh(message, index)"
          />
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
          <n-card
            v-for="scaffold in showScaffoldsList"
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
        </div>
      </div>
    </div>
    <!-- 输入区域 -->
    <div class="input-area">
      <div v-if="!canSendMessage" class="mask">
        请先构建一个包含前提、结论、辩护的论证图谱(每一个至少10个字)
      </div>
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
            clearable
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
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    color: white;
    font-size: 12px;
    cursor: not-allowed;
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
