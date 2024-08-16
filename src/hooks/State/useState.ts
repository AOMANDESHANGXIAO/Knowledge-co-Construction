import { ref, UnwrapRef, Ref } from 'vue'

function useState<T>(
  initialValue: T
): [Ref<UnwrapRef<T>>, (newValue: UnwrapRef<T>) => void] {
  const state = ref<T>(initialValue)

  function setState(newValue: UnwrapRef<T>): void {
    state.value = newValue
  }

  return [state, setState]
}

export default useState 
