<script lang="ts" setup>
import { useColorStore } from '@/store/modules/color'
defineOptions({
  name: 'my-button',
})

interface Props {
  loading?: boolean
  _type?: 'OK' | 'Cancel',
}

const props = withDefaults(defineProps<Props>(), {
  _type: 'OK',
  loading: false,
})

const emit = defineEmits<{
  (e: 'click'): void
}>()

const { themeColor } = useColorStore()

const handleClick = () => {
  emit('click')
}
</script>

<template>
  <el-button
    :color="themeColor"
    style="margin-left: 10px"
    @click="handleClick"
    :plain="props._type === 'Cancel' || false"
    :loading="props.loading || false"
  >
    {{ props._type === 'Cancel' ? '取消' : '确定' }}
  </el-button>
</template>

<style lang="scss" scoped></style>
