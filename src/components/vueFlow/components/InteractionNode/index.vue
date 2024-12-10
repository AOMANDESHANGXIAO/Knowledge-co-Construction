<script lang="ts" setup>
import { Handle, Position } from '@vue-flow/core'
// import icon from './components/icon/index.vue'
import { useAnimate } from '@vueuse/core' // 引入 useAnimation
import animate from '@/components/vueFlow/animate.ts'
import eventBus from '@/hooks/eventBus.ts'
import {
  InteractionNodeType,
  GetInteractionResponse,
} from '@/apis/viewpoint/interface.ts'
import ViewPointAPI from '@/apis/viewpoint'
import { useUserStore } from '@/store/modules/user'
import useRequest from '@/hooks/Async/useRequest'
import { BLUE, GREEN, YELLOW, PURPLE, RED } from '@/config'
// import { ThumbsUpSharp, ThumbsDownSharp } from '@vicons/ionicons5'
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
}
function APIFactory() {
  return GetDataAPIFunctionMap[props.data.type]
}
const requestAPI = APIFactory()
const contentList = ref<GetInteractionResponse['list']>([])
const { run: getData } = useRequest({
  apiFn: async () => {
    return requestAPI()
  },
  onSuccess(data: GetInteractionResponse) {
    contentList.value = data.list
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
    idea: {
      buttons: [
        {
          text: '修改',
          color: BLUE,
          onClick: () => {
            console.log('修改自己观点')
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
            console.log('修改自己提問')
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
            console.log('修改自己的回应')
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
            console.log('修改自己的反驳')
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
            console.log('修改自己的赞同')
          },
        },
      ],
    },
  },
  /**
   * 不是自己的观点
   */
  notSelf: {
    idea: {
      buttons: [
        {
          text: '赞成',
          color: GREEN,
          onClick: () => {
            console.log('赞成')
          },
        },
        {
          text: '困惑',
          color: YELLOW,
          onClick: () => {
            console.log('困惑')
          },
        },
        {
          text: '反对',
          color: RED,
          onClick: () => {
            console.log('反对')
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
            console.log('解释')
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
            console.log('赞成')
          },
        },
        {
          text: '困惑',
          color: YELLOW,
          onClick: () => {
            console.log('困惑')
          },
        },
        {
          text: '反对',
          color: RED,
          onClick: () => {
            console.log('反对')
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
            console.log('赞成')
          },
        },
        {
          text: '困惑',
          color: YELLOW,
          onClick: () => {
            console.log('困惑')
          },
        },
        {
          text: '反对',
          color: RED,
          onClick: () => {
            console.log('反对')
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
            console.log('赞成')
          },
        },
        {
          text: '困惑',
          color: YELLOW,
          onClick: () => {
            console.log('困惑')
          },
        },
        {
          text: '反对',
          color: RED,
          onClick: () => {
            console.log('反对')
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
  <n-popover trigger="click" :show-arrow="false">
    <template #trigger>
      <div
        class="interaction-node"
        ref="el"
        :style="{ backgroundColor: props.data.bgc }"
        @click="handleCheckIdea"
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
      <div style="display: flex; align-items: center">
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
      </div>
    </template>
    <div>
      <div
        v-for="item in contentList"
        style="margin-bottom: 10px; border-bottom: 1px solid rgb(0, 0, 0, 0.4)"
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
    </div>
    <template #footer>
      <n-space>
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
