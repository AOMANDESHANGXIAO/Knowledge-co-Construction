<script lang="ts" setup>
defineOptions({
  name: 'lightText',
})

interface Style {
  color: string
  backgroundColor: string
  [key: string]: string
}

const props = withDefaults(
  defineProps<{
    style: Style
    keywords: string[]
  }>(),
  {
    style: () => {
      return {
        color: 'black',
        backgroundColor: 'yellow',
      }
    },
    keywords: () => {
      return []
    },
  }
)

const el = ref<HTMLElement | null>(null)

function highlight(content: string): string {
  props.keywords.forEach(keyword => {
    const regex = new RegExp(keyword, 'gi')

    content = content.replace(
      regex,
      `<span style="color: ${props.style.color}; background-color: ${props.style.backgroundColor}">${keyword}</span>`
    )
  })

  return content
}

onMounted(() => {
  const innerText = el.value?.innerText
  el.value!.innerHTML = highlight(innerText!)
  // console.log(el.value?.innerText)
})
</script>

<template>
  <span ref="el">
    <slot></slot>
  </span>
</template>

<style lang="scss" scoped></style>
