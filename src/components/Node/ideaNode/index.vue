<script lang="ts" setup>
import { Handle, Position } from '@vue-flow/core'
import lottie from '@/components/common/lottie/index.vue'
import LoadingAnimation from '@/assets/animation/loading.json'
import { IdeaNodeProps } from './type.ts'
import { queryNodeContentApi } from '@/apis/flow/index.ts'
import { useCssVar } from '@vueuse/core'
import NodePopover from '@/components/NodePopover/index.vue'

// 控制按钮的主题颜色
const themeColor = useCssVar('--theme-color')

interface Props {
  data: IdeaNodeProps
}

const props = withDefaults(defineProps<Props>(), {
  data: () => ({
    id: 'noId', // 传下来的是节点的id
    name: '学生',
    bgc: '#fff',
    sourcePosition: Position.Bottom,
    targetPosition: Position.Top,
  }),
})

// 控制学生内容信息的加载
const loading = ref<boolean>(true)

const optionText = ref<string>('')

const isShow = ref<boolean>(false)
const isSuccess = ref<boolean>(false) // 判定是否成功加载

const handleIsShow = () => {
  isShow.value = !isShow.value
  if (!isSuccess.value && isShow.value) {
    loading.value = true
    queryNodeContent()
  }
}

const queryNodeContent = () => {
  const node_id = Number(props.data.id)

  queryNodeContentApi(node_id)
    .then(res => {
      const data: any = res
      if (data.success) {
        isSuccess.value = true
        optionText.value = data.data.content
      } else {
        optionText.value = data.message
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
const emits = defineEmits(['reply-oppose', 'reply-approve'])

const sendReply = (emitEvent: 'reply-oppose' | 'reply-approve') => {
  const payload = {
    id: props.data.id,
    content: optionText.value,
  }
  emits(emitEvent, payload)
}
</script>

<template>
  <div
    class="idea-node"
    ref="myHoverableElement"
    :style="{ backgroundColor: props.data.bgc }"
  >
    <Handle :position="props.data.targetPosition" type="target" />
    <Handle :position="props.data.sourcePosition" type="source" />
    <span @click="handleIsShow">{{ props.data.name }}</span>
    <NodePopover :is-show="isShow" :offset-width="50" :offset-height="50">
      <div class="idea-container">
        <lottie v-if="loading" :animation-data="LoadingAnimation" />
        <div v-else style="width: 100%">
          <el-text>{{ optionText }}</el-text>
          <el-divider content-position="center">🤔回应</el-divider>
          <div class="button-group">
            <el-button type="danger" @click="sendReply('reply-oppose')"
              >比较反对</el-button
            >
            <el-button :color="themeColor" @click="sendReply('reply-approve')"
              >比较赞同</el-button
            >
          </div>
        </div>
      </div>
    </NodePopover>
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
</style>
