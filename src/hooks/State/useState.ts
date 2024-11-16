import { ref, UnwrapRef, Ref } from 'vue'
import _ from 'lodash'
/**
 *
 * @param initialValue
 * @returns
 * @description 这是一个仿React风格的管理state hook，在此基础上我们扩展了功能，使其可以记录上一次的state
 */
function useState<T>(
  initialValue: T,
  option?: {
    onUpdate?: () => void
  }
): [Ref<UnwrapRef<T>>, (newValue: UnwrapRef<T>) => void, Ref<UnwrapRef<T>>] {
  const onUpdate = option?.onUpdate
  const throttledOnUpdate = _.throttle(onUpdate || (() => {}), 1000)
  const state = ref<T>(initialValue)
  const previousState = ref<T>(initialValue)

  function setState(newValue: UnwrapRef<T>): void {
    previousState.value = state.value
    state.value = newValue
    throttledOnUpdate()
  }

  return [
    state as Ref<UnwrapRef<T>>,
    setState,
    previousState as Ref<UnwrapRef<T>>,
  ]
}
export default useState
