<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'
import { GroupNodeProps, TimeLineItem } from './type.ts'
import { ref } from 'vue'
import NodePopover from '@/components/NodePopover/index.vue'
import { useElementSize } from '@vueuse/core'
import { useColorStore } from '@/store/modules/color'
import { useUserStore } from '@/store/modules/user'
import { queryReviseData } from '@/apis/group'
import type { ElScrollbar } from 'element-plus'
import router from '@/router/index.ts'

interface Props {
  data: GroupNodeProps
}

const props = withDefaults(defineProps<Props>(), {
  data: () => ({
    groupName: '小组A',
    groupConclusion: '暂时没有讨论结果...',
    bgc: '#FFA62F',
    sourcePosition: Position.Bottom, // 出来
    targetPosition: Position.Top, // 进来
  }),
})

const containerRef = ref<HTMLElement | null>(null)

const { width, height } = useElementSize(containerRef)

const userStore = useUserStore()

const isSuccess = ref(false)

const queryReviseDataApi = () => {
  const topic_id = router.currentRoute.value.query
    ?.topic_id as unknown as number
  const group_id = userStore.userInfo.group_id as unknown as number

  queryReviseData(group_id, topic_id).then((res: any) => {
    const data: any = res
    if (data.success) {
      timeLineList.value = data.data.list
      isSuccess.value = true
    } else {
      ElNotification({
        title: '提示',
        message: '获取数据失败',
        type: 'error',
        duration: 3000,
      })
    }
  })
}

const handleClick = () => {
  console.log('click')
  isShow.value = !isShow.value
  if (!isSuccess.value && isShow.value) {
    queryReviseDataApi()
  }
}

const isShow = ref(false)

const colorStore = useColorStore()

const timeLineList = ref<TimeLineItem[]>([
  {
    timestamp: '2018/4/12',
    content: 'We think that we can do better.',
    creator: 'Tom',
  },
  {
    timestamp: '2018/4/13',
    content: 'We think that we can do Best!!.',
    creator: 'Jerry',
  },
])

const emits = defineEmits(['revise'])

const handleClickReviseButton = () => {
  emits('revise')
}

const scrollbarRef = ref<InstanceType<typeof ElScrollbar> | null>(null)

const handleScrollToBottom = () => {
  scrollbarRef.value?.setScrollTop(9999999)
}

const isShowDotArrow = ref(true)
</script>

<template>
  <div class="container" ref="containerRef">
    <Handle type="target" :position="props.data.targetPosition" />
    <Handle type="source" :position="props.data.sourcePosition" />
    <div class="title" :style="{ backgroundColor: props.data.bgc }">
      {{ props.data.groupName }}
    </div>
    <div class="content" @click="handleClick">
      <el-text>{{ props.data.groupConclusion }}</el-text>
    </div>
    <NodePopover
      :is-show="isShow"
      :offset-width="width"
      :offset-height="height"
      :width="400"
    >
      <el-scrollbar max-height="400px" style="position: relative" ref="scrollbarRef">
        <div class="dot-arrow" @click="handleScrollToBottom">
          <el-icon><Bottom /></el-icon>
        </div>
        <el-timeline>
          <el-timeline-item
            :timestamp="item.timestamp"
            placement="top"
            :color="colorStore.themeColor"
            v-for="(item, index) in timeLineList"
            :key="index"
          >
            <el-card>
              <el-divider content-position="left">
                <h4>修改内容</h4>
              </el-divider>
              <el-text>{{ item.content }}</el-text>
              <el-divider></el-divider>
              <p>{{ item.creator }} 修改 {{ item.timestamp }}</p>
            </el-card>
          </el-timeline-item>
        </el-timeline>
        <el-divider></el-divider>
        <el-button
          :color="colorStore.themeColor"
          size="large"
          width="100%"
          round
          @click="handleClickReviseButton"
          >修改</el-button
        >
      </el-scrollbar>
    </NodePopover>
  </div>
</template>

<style scoped lang="scss">
.container {
  width: 180px;
  border-radius: 10px;
  background-color: #f3f7ec;
  position: relative;

  &:hover {
    background-color: darken(#f3f7ec, 10%);
  }

  .title {
    width: 100%;
    height: 40px;
    line-height: 40px;
    text-align: center;
    color: #f9f9f9;
    //background-color: #67c23a;
  }

  .content {
    width: 100%;
    max-height: 300px;
    overflow: hidden;
    padding: 10px;
    font-size: 20px;
    color: #242424;
    text-overflow: ellipsis;
    -webkit-line-clamp: 3;
    display: -webkit-box;
    -webkit-box-orient: vertical;
  }
  :deep(.el-button) {
    width: 100%;
  }
}

.dot-arrow {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  bottom: 20px;
  left: 0;
  margin-left: 50%;
  transform: translateX(-50%);
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: #fff;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.12);
  z-index: 10;
  cursor: pointer;
  &:hover {
    background-color: var(--theme-color);
    .el-icon {
      color: #fff;
    }
  }
}
</style>
