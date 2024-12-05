<script lang="ts" setup>
import { Handle, Position } from '@vue-flow/core'
import { IdeaNodeProps } from './type.ts'
import icon from './components/icon/index.vue'
import { useAnimate } from '@vueuse/core' // 引入 useAnimation
import animate from '@/components/vueFlow/animate.ts'
import eventBus from '@/hooks/eventBus.ts'

interface Props {
  data: IdeaNodeProps
}

const props = withDefaults(defineProps<Props>(), {
  data: () => ({
    id: 'noId', // 传下来的是节点的id
    name: '学生',
    bgc: '#fff',
    student_id: 0,
    sourcePosition: Position.Bottom,
    targetPosition: Position.Top,
    highlight: true,
  }),
})

// 向父组件传递事件,click, 由父组件判断是查看还是修改
const emits = defineEmits<{
  (
    e: 'onClickIdeaNode',
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
  emits('onClickIdeaNode', {
    nodeId: props.data.id,
    studentId: String(props.data.student_id),
  })
}
onMounted(() => {
  eventBus.on('animate', (id: string) => {
    if(id === props.data.id) {
      handlePlay()
    }
  })
})
</script>

<template>
  <div
    class="idea-node"
    ref="el"
    :style="{ backgroundColor: props.data.bgc }"
    @click="handleCheckIdea"
  >
    <Handle :position="(props.data.targetPosition as Position)" type="target" />
    <Handle :position="(props.data.sourcePosition as Position)" type="source" />
    <span>
      {{ props.data.name }}
    </span>
    <icon class="icon" v-if="props.data?.highlight"></icon>
  </div>
</template>

<style lang="scss" scoped>
$node-width: 50px;

.idea-node {
  position: relative;
  width: $node-width;
  height: $node-width;
  border-radius: 50%;
  background-color: #67c23a;
  color: #fff;
  font-size: 10px;
  text-align: center;
  line-height: $node-width;

  .icon {
    position: absolute;
    top: 0;
    left: -5px;
  }

  span {
    display: block;
    width: 100%;
    height: 100%;
  }

  &:hover {
    background-color: lighten($color: #67c23a, $amount: 10%);
  }

  .idea-container {
    width: 100%;
    height: 100%;
    min-width: 400px;
    max-width: 400px;
    text-align: left;
    line-height: 1;

    &:deep(.el-text) {
      font-size: 12px;
    }

    .button-group {
      display: flex;
      justify-content: space-between;
      width: 100%;

      &:deep(.el-button) {
        margin-left: 0;

        span {
          color: #f3f3f3;
          font-size: 14px;
        }

        //font-size: 14px;
      }
    }
  }
}

.idea-node.highlight {
  animation: highlight 0.5s ease-in-out infinite;
}

@keyframes highlight {
  0% {
    // bgackground-color: #fff;
    bgackground-color: #fff;
  }
  100% {
    background-color: var(--theme-color);
  }
}
</style>
