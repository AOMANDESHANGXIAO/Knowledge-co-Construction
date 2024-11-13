interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

interface StorageChatHistory {
  id: string
  title: string
  messages: ChatMessage[]
}

export default function useLocalStorageMessage() {
  const LOCAL_CHAT_HISTORY_KEY = 'allMessageList'

  const getAllMessageList = () => {
    const allMessageList = localStorage.getItem(LOCAL_CHAT_HISTORY_KEY)
    if (allMessageList) {
      return JSON.parse(allMessageList) as StorageChatHistory[]
    }
    return [] as StorageChatHistory[]
  }

  const lastChatId = ref<string>('')
  const LOCAL_CHAT_ID_KEY = 'lastChatId'
  const saveLastChatId = (id: string) => {
    localStorage.setItem(LOCAL_CHAT_ID_KEY, id)
    lastChatId.value = id
  }

  const getLastChatId = () => {
    const id = localStorage.getItem(LOCAL_CHAT_ID_KEY)
    if (id) {
      return id
    }
    return ''
  }

  lastChatId.value = getLastChatId()

  const getChatHistoryById = (id: string) => {
    const allMessageList = getAllMessageList()
    return allMessageList.find(item => item.id === id)?.messages || []
  }

  const getCurrentChatMessages = () => {
    return getChatHistoryById(lastChatId.value)
  }

  const saveChatHistory = (id: string, messages: ChatMessage[]) => {
    const allMessageList = getAllMessageList()
    const index = allMessageList.findIndex(item => item.id === id)
    if (index !== -1) {
      allMessageList[index].messages = messages
    } else {
      allMessageList.push({
        id,
        title: `Chat ${allMessageList.length + 1}`,
        messages,
      })
    }
    localStorage.setItem(LOCAL_CHAT_HISTORY_KEY, JSON.stringify(allMessageList))
    lastChatId.value = id
  }

  const deleteChatHistory = (id: string) => {
    const allMessageList = getAllMessageList()
    const index = allMessageList.findIndex(item => item.id === id)
    if (index !== -1) {
      allMessageList.splice(index, 1)
    }
    localStorage.setItem(LOCAL_CHAT_HISTORY_KEY, JSON.stringify(allMessageList))
    if (lastChatId.value === id) {
      // 如果删除的是当前的聊天记录，则将 lastChatId 设置为第一个聊天记录的 id
      if (allMessageList.length > 0) {
        lastChatId.value = allMessageList[0].id
      } else {
        // 如果为空，则新创建一个聊天记录
        const newId = new Date().getTime().toString()
        lastChatId.value = newId
        saveChatHistory(newId, [])
      }
    }
  }

  const getCurrentChatTitle = () => {
    const allMessageList = getAllMessageList()
    const currentChat = allMessageList.find(
      item => item.id === lastChatId.value
    )
    return currentChat?.title || 'New Chat'
  }

  const currentChatTitle = ref<string>(getCurrentChatTitle())

  const setChatTitle = (title: string, id: string) => {
    const allMessageList = getAllMessageList()
    const index = allMessageList.findIndex(item => item.id === id)
    if (index !== -1) {
      allMessageList[index].title = title
    }
    localStorage.setItem(LOCAL_CHAT_HISTORY_KEY, JSON.stringify(allMessageList))
  }

  const updateCurrentChatTitle = () => {
    currentChatTitle.value = getCurrentChatTitle()
  }

  watch(() => lastChatId.value, updateCurrentChatTitle)

  const clearChatHistory = (id: string) => {
    // 重置当前聊天记录
    saveChatHistory(id, [])
  }

  return {
    getCurrentChatMessages,
    saveLastChatId,
    getChatHistoryById,
    saveChatHistory,
    getAllMessageList,
    lastChatId,
    deleteChatHistory,
    currentChatTitle,
    setChatTitle,
    updateCurrentChatTitle,
    clearChatHistory,
  }
}
