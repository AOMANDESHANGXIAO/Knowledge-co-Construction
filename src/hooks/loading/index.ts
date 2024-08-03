/*
 * @Author       : ridiculous adventurer
 * @Version      : V1.0
 * @Date         : 2024-08-03 09:24:01
 * @Description  :
 */
import { ref } from 'vue'

function useLoading() {
  const loading = ref(false)

  const setLoading = (value: boolean) => {
    loading.value = value
  }

  return { loading, setLoading }
}

export { useLoading }
