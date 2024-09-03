/**
 * useRequest
 * 需求：
 * 1. 可以用于发送请求函数
 * 2. 用于错误处理函数
 * 3. 相应完成函数
 * 4. 格式化函数
 * 5. 防抖节流设置
 */
import { ref, onUnmounted } from 'vue'

interface UseRequestOptions {
  apiFn: (...args: any) => Promise<any>
  onSuccess?: (...args: any) => void
  onFail?: (...args: any) => void
  onError?: (...args: any) => void
  onFinally?: (...args: any) => void
  formatter?: (data: any) => any
  debounce?: number
  throttle?: number
}

export default function useRequest(props: UseRequestOptions) {
  const {
    apiFn,
    onSuccess,
    onFail,
    onError,
    onFinally,
    formatter,
    debounce = 0,
    throttle = 0,
  } = props

  const data = ref<any>(null)
  const error = ref<any>(null)
  const loading = ref<boolean>(false)
  let timer: any = null
  let lastCallTime: number | null = null

  const execute = async (...args: any) => {
    if (loading.value) return

    loading.value = true
    error.value = null

    try {
      const response = await apiFn(...args)
      if (response.success) {
        const resData = response.data
        const formattedData = formatter ? formatter(resData) : resData
        data.value = formattedData
        if (onSuccess) onSuccess(formattedData)
      } else {
        if (onFail) onFail(response)
      }
    } catch (err) {
      error.value = err
      if (onError) onError(err)
    } finally {
      if (onFinally) onFinally()
      loading.value = false
    }
  }

  const debouncedExecute = (...args: any) => {
    if (debounce > 0) {
      if (timer) clearTimeout(timer)
      timer = setTimeout(() => {
        execute(...args)
      }, debounce)
    } else {
      execute(...args)
    }
  }

  const throttledExecute = (...args: any) => {
    const now = Date.now()
    if (!lastCallTime || now - lastCallTime >= throttle) {
      execute(...args)
      lastCallTime = now
    }
  }

  const run = throttle > 0 ? throttledExecute : debouncedExecute

  onUnmounted(() => {
    if (timer) clearTimeout(timer)
  })

  return {
    data,
    error,
    loading,
    run,
  }
}
