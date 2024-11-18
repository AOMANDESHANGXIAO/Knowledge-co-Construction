interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
}
import { BASE_URL } from '@/apis'

export async function streamChat({
  messages,
  onMessage,
  getParams,
  onStart,
  onError,
  onFinish,
}: {
  messages: Message[]
  getParams: () => {
    student_id: string
    topic_id: string
    new_message: string
  }
  onStart?: () => void
  onMessage?: (content: string) => void
  onError?: (error: string) => void
  onFinish?: () => void
}) {
  try {
    onStart?.()
    const url = `${BASE_URL}/gpt/stream-completion`
    const user = localStorage.getItem('userInfo')
    let token = ''
    if (user) {
      token = JSON.parse(user).token
    }
    const { student_id, topic_id, new_message } = getParams()
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `${token}`,
      },
      body: JSON.stringify({ messages, student_id, topic_id, new_message }),
    })

    const reader = response.body?.getReader()
    const decoder = new TextDecoder()

    if (!reader) {
      throw new Error('Response body is null')
    }

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value)
      const lines = chunk.split('\n')

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6) // Remove 'data: ' prefix
          if (data === '[DONE]') {
            onFinish?.()
            return
          }

          try {
            const parsed = JSON.parse(data)
            if (parsed.error) {
              onError?.(parsed.error)
              return
            }
            if (parsed.content) {
              console.log(parsed.content)
              onMessage?.(parsed.content)
            }
          } catch (e) {
            console.error('Failed to parse SSE message:', e)
          }
        }
      }
    }
  } catch (error) {
    onError?.('网络错误，请稍后再试')
  }
}
