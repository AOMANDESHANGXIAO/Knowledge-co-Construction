import { useRouter } from 'vue-router'
import { computed } from 'vue'

function useQueryParam<T = any>(key: string) {
  const queryParams = useRouter().currentRoute.value.query

  return computed(() => {
    return queryParams[key] as T
  })
}
export default useQueryParam
