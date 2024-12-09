// src/hooks/useHoverDuration.ts
import { ref, onMounted, onUnmounted } from 'vue'

export default function useHoverDuration({
  duration,
  callback,
  element
}: {
  duration: number
  callback: () => void
  element: () => HTMLElement
}) {
  const isHovering = ref(false)
  let timer: ReturnType<typeof setTimeout> | null = null

  const handleMouseEnter = () => {
    isHovering.value = true
    timer = setTimeout(() => {
      if (isHovering.value) {
        callback()
      }
    }, duration)
  }

  const handleMouseLeave = () => {
    isHovering.value = false
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
  }

  onMounted(() => {
    const el = element()
    el.addEventListener('mouseenter', handleMouseEnter)
    el.addEventListener('mouseleave', handleMouseLeave)
  })

  onUnmounted(() => {
    const el = element()
    el.removeEventListener('mouseenter', handleMouseEnter)
    el.removeEventListener('mouseleave', handleMouseLeave)
  })

  return {
    isHovering
  }
}