// 强制更新组件 hook
import { ref } from 'vue'

function useRefresh() {
  // 使用时间戳作为组件的key
  const key = ref(new Date().getTime())

  function refresh() {
    key.value = new Date().getTime()
  }
  
  return {
    key,
    refresh
  }
}

export default useRefresh
