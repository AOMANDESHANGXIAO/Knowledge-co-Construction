// 强制更新组件 hook
import { ref } from 'vue'

function useForceUpdateComponent() {
  // 使用时间戳作为组件的key
  const key = ref(new Date().getTime())

  function forceUpdate() {
    key.value = new Date().getTime()
  }
  
  return {
    key,
    refresh: forceUpdate
  }
}

export default useForceUpdateComponent
