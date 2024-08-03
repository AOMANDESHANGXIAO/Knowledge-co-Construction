<script lang="ts" setup>
import { Handle, Position } from '@vue-flow/core'
import lottie from '@/components/common/lottie/index.vue'
import LoadingAnimation from '@/assets/animation/loading.json'
import { IdeaNodeProps } from './type.ts'
import { queryNodeContentApi } from '@/apis/flow/index.ts'
import { useCssVar } from '@vueuse/core'
import NodePopover from '@/components/NodePopover/index.vue'
import { useUserStore } from '@/store/modules/user'
import icon from './components/icon/index.vue'
import {
  ArgumentNode,
  EdgeType,
} from '@/views/Home/components/ArgumentFlowComponent/type.ts'


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

// 控制学生内容信息的加载
const loading = ref<boolean>(true)

const optionText = ref<string>('')
const nodes = ref<ArgumentNode[]>([])
const edges = ref<EdgeType[]>([])

const isSuccess = ref<boolean>(false) // 判定是否成功加载

const queryNodeContent = () => {
  const node_id = Number(props.data.id)

  queryNodeContentApi(node_id)
    .then(res => {
      const data = res
      if (data.success) {
        isSuccess.value = true
        nodes.value = data.data.nodes
        edges.value = data.data.edges
        // optionText.value = data.data.content
      } else {
        // optionText.value = data.message
        console.log(data.message)
      }
    })
    .catch(err => {
      optionText.value = '加载失败'
      console.log(err)
    })
    .finally(() => {
      loading.value = false
    })
}

// 向父组件传递事件，同意或者反对
const emits = defineEmits<{
  (e:'check', id: string): void
  (e:'oppose', id: string): void
  (e:'approve', id: string): void
  (e:'revise', id: string): void
}>()



// const emits = defineEmits(['reply-oppose', 'reply-approve', 'revise-self', 'check'])

const handleCheckIdea = () => {
  // 返回id
  console.log('check', props.data.id)
  emits('check', props.data.id)
}
</script>

<template>
  <div
    class="idea-node"
    ref="myHoverableElement"
    :style="{ backgroundColor: props.data.bgc }"
    @click="handleCheckIdea"
  >
    <Handle :position="props.data.targetPosition" type="target" />
    <Handle :position="props.data.sourcePosition" type="source" />
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
