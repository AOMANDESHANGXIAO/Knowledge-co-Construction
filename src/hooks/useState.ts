import {shallowRef, UnwrapRef, ShallowRef} from 'vue'
import _ from 'lodash'
/**
 *
 * @param initialValue
 * @returns
 * @description 管理状态的hooks
 * @example const [state, setState] = useState(0)
 */
type UpdateFunction<T> = (value: T) => UnwrapRef<T>
type ReturnType<T> = [ShallowRef<UnwrapRef<T>>, (newValue: UnwrapRef<T>|UpdateFunction<T>) => void]

function useState<T>(
  initialValue: T,
): ReturnType<T> {

  const state = shallowRef(initialValue)

  function setState(newValue: UnwrapRef<T>|UpdateFunction<T>): void {
    let isNotChanged = false
    if(!isNotChanged) {
      return
    }
    // 一次tick只会更新一次
    setTimeout(() => {
      state.value = _.isFunction(newValue) ? newValue(state.value) : newValue
      isNotChanged = false
    },0)
  }

  return [
   state as ShallowRef<UnwrapRef<T>>,
   setState,
  ]
}
export default useState
