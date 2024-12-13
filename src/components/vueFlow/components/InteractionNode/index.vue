<script lang="ts" setup>
import { Handle, Position } from '@vue-flow/core'
// import icon from './components/icon/index.vue'
// import { useAnimate } from '@vueuse/core' // 引入 useAnimation
// import animate from '@/components/vueFlow/animate.ts'
import eventBus from '@/hooks/eventBus.ts'
import {
  InteractionNodeType,
  GetInteractionResponse,
} from '@/apis/viewpoint/interface.ts'
import ViewPointAPI from '@/apis/viewpoint'
import { useUserStore } from '@/store/modules/user'
import useRequest from '@/hooks/Async/useRequest'
import { BLUE, GREEN, YELLOW, PURPLE, RED } from '@/config'
import { Refresh } from '@vicons/ionicons5'
import { useMessage } from 'naive-ui'

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
  (
    e: 'onClickInteractionButton',
    payload: {
      target: string
      contentList: GetInteractionResponse['list']
      action: InteractionNodeType
      mode: 'post' | 'patch'
    }
  ): void
}>()
const el = ref<HTMLElement | null>(null)
const isAnimate = ref(false)

const handlePlay = () => {
  isAnimate.value = true
}

defineExpose({ handlePlay })

onMounted(() => {
  eventBus.on('animate', (id: string) => {
    if (id === props.data.id) {
      handlePlay()
    }
  })
})
const { getOneUserInfo } = useUserStore()
const studentId = getOneUserInfo<string>('id')
const checkIsStudentSelfNode = () => {
  return String(props.data.student_id) === String(studentId)
}
interface Buttons {
  text: string
  color: string
  onClick: () => void
}
interface DataMap {
  idea: {
    buttons: Buttons[]
  }
  ask: {
    buttons: Buttons[]
  }
  response: {
    buttons: Buttons[]
  }
  disagree: {
    buttons: Buttons[]
  }
  agree: {
    buttons: Buttons[]
  }
  group: {
    buttons: Buttons[]
  }
}

/**
 * 写一个柯里化函数
 */
const params = computed(() => {
  return {
    student_id: Number(props.data.student_id),
    id: Number(props.data.id),
  }
})
const GetDataAPIFunctionMap = {
  idea: () => ViewPointAPI.getIdea(params.value),
  ask: () => ViewPointAPI.getAsk(params.value),
  response: () => ViewPointAPI.getResponse(params.value),
  agree: () => ViewPointAPI.getAgree(params.value),
  disagree: () => ViewPointAPI.getDisAgree(params.value),
  group: () => ViewPointAPI.getGroup(params.value),
}
function APIFactory() {
  return GetDataAPIFunctionMap[props.data.type]
}
const requestAPI = APIFactory()
const contentList = ref<GetInteractionResponse['list']>([])
const message = useMessage()
const { run: getData, loading } = useRequest({
  apiFn: async () => {
    return requestAPI()
  },
  onSuccess(data: GetInteractionResponse) {
    contentList.value = data.list
  },
  onError() {
    message.error('请求出错啦,请重新尝试')
  },
  onFail() {
    message.error('请求出错啦,请重新尝试')
  },
})
const handleCheckIdea = () => {
  /**
   * 查询
   */
  getData()
  // 返回id
  emits('onClickInteractionNode', {
    nodeId: props.data.id,
    studentId: String(props.data.student_id),
  })
}
const popoverDataMap: {
  self: DataMap
  notSelf: DataMap
} = {
  /**
   * 是自己的观点
   */
  self: {
    group: {
      buttons: [],
    },
    idea: {
      buttons: [
        {
          text: '修改',
          color: BLUE,
          onClick: () => {
            emits('onClickInteractionButton', {
              target: props.data.id,
              contentList: contentList.value,
              action: 'idea',
              mode: 'patch',
            })
          },
        },
      ],
    },
    ask: {
      buttons: [
        {
          text: '修改',
          color: BLUE,
          onClick: () => {
            emits('onClickInteractionButton', {
              target: props.data.id,
              contentList: contentList.value,
              action: 'ask',
              mode: 'patch',
            })
          },
        },
      ],
    },
    response: {
      buttons: [
        {
          text: '修改',
          color: BLUE,
          onClick: () => {
            emits('onClickInteractionButton', {
              target: props.data.id,
              contentList: contentList.value,
              action: 'response',
              mode: 'patch',
            })
          },
        },
      ],
    },
    disagree: {
      buttons: [
        {
          text: '修改',
          color: BLUE,
          onClick: () => {
            emits('onClickInteractionButton', {
              target: props.data.id,
              contentList: contentList.value,
              action: 'disagree',
              mode: 'patch',
            })
          },
        },
      ],
    },
    agree: {
      buttons: [
        {
          text: '修改',
          color: BLUE,
          onClick: () => {
            emits('onClickInteractionButton', {
              target: props.data.id,
              contentList: contentList.value,
              action: 'agree',
              mode: 'patch',
            })
          },
        },
      ],
    },
  },
  /**
   * 不是自己的观点
   */
  notSelf: {
    group: {
      buttons: [],
    },
    idea: {
      buttons: [
        {
          text: '赞成',
          color: GREEN,
          onClick: () => {
            emits('onClickInteractionButton', {
              target: props.data.id,
              contentList: contentList.value,
              action: 'agree',
              mode: 'post',
            })
          },
        },
        {
          text: '困惑',
          color: YELLOW,
          onClick: () => {
            emits('onClickInteractionButton', {
              target: props.data.id,
              contentList: contentList.value,
              action: 'ask',
              mode: 'post',
            })
          },
        },
        {
          text: '反对',
          color: RED,
          onClick: () => {
            emits('onClickInteractionButton', {
              target: props.data.id,
              contentList: contentList.value,
              action: 'disagree',
              mode: 'post',
            })
          },
        },
      ],
    },
    ask: {
      buttons: [
        {
          text: '解释',
          color: BLUE,
          onClick: () => {
            emits('onClickInteractionButton', {
              target: props.data.id,
              contentList: contentList.value,
              action: 'response',
              mode: 'post',
            })
          },
        },
      ],
    },
    response: {
      buttons: [
        {
          text: '赞成',
          color: GREEN,
          onClick: () => {
            emits('onClickInteractionButton', {
              target: props.data.id,
              contentList: contentList.value,
              action: 'agree',
              mode: 'post',
            })
          },
        },
        {
          text: '困惑',
          color: YELLOW,
          onClick: () => {
            emits('onClickInteractionButton', {
              target: props.data.id,
              contentList: contentList.value,
              action: 'ask',
              mode: 'post',
            })
          },
        },
        {
          text: '反对',
          color: RED,
          onClick: () => {
            emits('onClickInteractionButton', {
              target: props.data.id,
              contentList: contentList.value,
              action: 'disagree',
              mode: 'post',
            })
          },
        },
      ],
    },
    disagree: {
      buttons: [
        {
          text: '赞成',
          color: GREEN,
          onClick: () => {
            emits('onClickInteractionButton', {
              target: props.data.id,
              contentList: contentList.value,
              action: 'agree',
              mode: 'post',
            })
          },
        },
        {
          text: '困惑',
          color: YELLOW,
          onClick: () => {
            emits('onClickInteractionButton', {
              target: props.data.id,
              contentList: contentList.value,
              action: 'ask',
              mode: 'post',
            })
          },
        },
        {
          text: '反对',
          color: RED,
          onClick: () => {
            emits('onClickInteractionButton', {
              target: props.data.id,
              contentList: contentList.value,
              action: 'disagree',
              mode: 'post',
            })
          },
        },
      ],
    },
    agree: {
      buttons: [
        {
          text: '赞成',
          color: GREEN,
          onClick: () => {
            emits('onClickInteractionButton', {
              target: props.data.id,
              contentList: contentList.value,
              action: 'agree',
              mode: 'post',
            })
          },
        },
        {
          text: '困惑',
          color: YELLOW,
          onClick: () => {
            emits('onClickInteractionButton', {
              target: props.data.id,
              contentList: contentList.value,
              action: 'ask',
              mode: 'post',
            })
          },
        },
        {
          text: '反对',
          color: RED,
          onClick: () => {
            emits('onClickInteractionButton', {
              target: props.data.id,
              contentList: contentList.value,
              action: 'disagree',
              mode: 'post',
            })
          },
        },
      ],
    },
  },
}
const titleReflectDataMap = {
  idea: {
    text: '观点',
    color: BLUE,
  },
  agree: {
    text: '赞成',
    color: GREEN,
  },
  disagree: {
    text: '反对',
    color: RED,
  },
  ask: {
    text: '困惑',
    color: YELLOW,
  },
  response: {
    text: '回应',
    color: PURPLE,
  },
  group: {
    text: '组',
    color: '#000',
  },
}
const popoverRenderHeader = computed(() => {
  const data = titleReflectDataMap[props.data.type]
  if (checkIsStudentSelfNode()) {
    return {
      ...data,
      text: '我的' + data.text,
    }
  }
  return data
})
const popoverRenderFooter = computed(() => {
  if (checkIsStudentSelfNode()) {
    return {
      buttons: popoverDataMap.self[props.data.type].buttons,
    }
  }
  return {
    buttons: popoverDataMap.notSelf[props.data.type].buttons,
  }
})
</script>

<template>
  <n-message-provider>
    <n-popover
      trigger="click"
      :show-arrow="false"
      style="
        min-width: 250px;
        max-width: 500px;
        max-height: 500px;
        overflow: auto;
      "
    >
      <template #trigger>
        <div
          class="interaction-node"
          ref="el"
          :style="{ backgroundColor: props.data.bgc }"
          @click="handleCheckIdea"
          :class="isAnimate ? 'highlight' : ''"
          @animationend="isAnimate = false"
        >
          <Handle
            :position="(props.data.targetPosition as Position)"
            type="target"
          />
          <Handle
            :position="(props.data.sourcePosition as Position)"
            type="source"
          />
          <div class="text">
            <section class="name">{{ props.data.name }}</section>
          </div>
        </div>
      </template>
      <template #header>
        <div style="display: flex; align-items: center; position: relative">
          <div
            :style="{
              width: '10px',
              height: '20px',
              'background-color': popoverRenderHeader.color,
            }"
          ></div>
          <n-text
            strong
            depth="1"
            :style="{
              color: popoverRenderHeader.color,
              fontSize: '20px',
              marginLeft: '10px',
            }"
            >{{ popoverRenderHeader.text }}
          </n-text>
          <n-button
            tertiary
            circle
            type="primary"
            style="position: absolute; right: 10px"
            :loading="loading"
            @click="
              () => {
                getData()
              }
            "
          >
            <template #icon>
              <n-icon><Refresh /></n-icon>
            </template>
          </n-button>
        </div>
      </template>
      <div>
        <div
          v-if="contentList.length"
          v-for="item in contentList"
          style="
            margin-bottom: 10px;
            border-bottom: 1px solid rgb(0, 0, 0, 0.4);
          "
        >
          <n-h3
            prefix="bar"
            type="info"
            :key="item.key"
            style="margin-bottom: 5px"
          >
            <n-text>{{ item.title }}</n-text>
          </n-h3>
          <n-text>{{ item.value }}</n-text>
        </div>
        <div style="width: 100%" v-else>
          <n-skeleton text :repeat="2" />
          <n-skeleton text style="width: 60%" />
        </div>
      </div>
      <template #footer>
        <n-space justify="center">
          <n-button
            v-for="(item, index) in popoverRenderFooter.buttons"
            :key="index"
            :color="item.color"
            @click="item.onClick"
            >{{ item.text }}</n-button
          >
        </n-space>
      </template>
    </n-popover>
  </n-message-provider>
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
.interaction-node:hover {
  .text {
    .name {
      text-decoration: underline;
    }
  }
}
.highlight {
  animation: highlight 1s ease-in-out;
}
@keyframes highlight {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  25% {
    transform: scale(1.2);
    opacity: 0.5;
  }
  50% {
    transform: scale(1);
    opacity: 1;
  }
  75% {
    transform: scale(1.2);
    opacity: 0.5;
  }
  100% {
    transform: scale(1);
    opacity: 0.5;
  }
}
</style>
