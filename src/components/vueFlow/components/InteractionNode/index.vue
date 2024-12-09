<script lang="ts" setup>
import { Handle, Position } from '@vue-flow/core'
// import icon from './components/icon/index.vue'
import { useAnimate } from '@vueuse/core' // 引入 useAnimation
import animate from '@/components/vueFlow/animate.ts'
import eventBus from '@/hooks/eventBus.ts'
import { InteractionNodeType } from '@/apis/viewpoint/interface.ts'

interface Props {
  data: {
    type: InteractionNodeType
    id: string
    name: string
    bgc: string
    student_id: number | string
    sourcePosition: Position
    targetPosition: Position
  }
}

const props = withDefaults(defineProps<Props>(), {
  data: () => ({
    type: 'idea',
    id: 'noId', // 传下来的是节点的id
    name: '学生',
    bgc: '#fff',
    student_id: 0,
    sourcePosition: Position.Bottom,
    targetPosition: Position.Top,
  }),
})

// 向父组件传递事件,click, 由父组件判断是查看还是修改
const emits = defineEmits<{
  (
    e: 'onClickInteractionNode',
    payload: {
      nodeId: string
      studentId: string
    }
  ): void
}>()
const el = ref<HTMLElement | null>(null)
const keyframes = ref(animate)
const { play } = useAnimate(el, keyframes, 1000)

const handlePlay = () => {
  play()
}

defineExpose({ handlePlay })

const handleCheckIdea = () => {
  // 返回id
  emits('onClickInteractionNode', {
    nodeId: props.data.id,
    studentId: String(props.data.student_id),
  })
}
onMounted(() => {
  eventBus.on('animate', (id: string) => {
    if (id === props.data.id) {
      handlePlay()
    }
  })
})
</script>

<template>
  <div
    class="interaction-node"
    ref="el"
    :style="{ backgroundColor: props.data.bgc }"
    @click="handleCheckIdea"
  >
    <Handle :position="(props.data.targetPosition as Position)" type="target" />
    <Handle :position="(props.data.sourcePosition as Position)" type="source" />
    <div class="text">
      <section class="name">{{ props.data.name }}</section>
    </div>
  </div>
</template>

<style lang="scss" scoped>
$node-width: 60px;

.interaction-node {
  position: relative;
  width: $node-width;
  height: $node-width;
  border-radius: 50%;
  background-color: #67c23a;
  color: #fff;
  font-size: 10px;
  text-align: center;
  cursor: pointer;
  .icon {
    position: absolute;
    top: 0;
    left: -5px;
  }
  .text {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    // padding: 10px;
  }
}
</style>
