/*
 * @Author       : ridiculous adventurer
 * @Version      : V1.0
 * @Date         : 2024-07-31 11:08:41
 * @Description  :
 */
import { ref } from 'vue'

const isVisible = ref(false)
const message = ref('')
let resolveCallback: Function

export function useDialogState() {
  return {
    isVisible,
    message,
    resolve: (value: any) => {
      if (resolveCallback) {
        resolveCallback(value)
      }
    },
  }
}

export function useDialog() {
  return {
    confirm(msg: any) {
      isVisible.value = true
      message.value = msg
      return new Promise(resolve => {
        resolveCallback = resolve
      })
    },
  }
}
