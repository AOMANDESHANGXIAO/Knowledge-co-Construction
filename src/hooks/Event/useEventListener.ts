import { onMounted, onUnmounted } from 'vue'
import _ from 'lodash'

export default function useEventListener({
  el,
  event,
  listener,
  options,
  debounce,
  throttle,
}: {
  el: HTMLElement | Window
  event: string
  listener: EventListener
  options?: boolean | AddEventListenerOptions
  debounce?: number
  throttle?: number
}) {
  if (debounce) {
    listener = _.debounce(listener, debounce)
  }

  if (throttle) {
    listener = _.throttle(listener, throttle)
  }

  onMounted(() => {
    el.addEventListener(event, listener, options)
  })

  onUnmounted(() => {
    el.removeEventListener(event, listener, options)
  })
}
