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
import { Edit } from '@element-plus/icons-vue'

interface Props {
  data: GroupNodeProps
}

const props = withDefaults(defineProps<Props>(), {
  data: () => ({
    groupName: '小组A',
    groupConclusion: '暂时没有讨论结果...',
    bgc: '#FFA62F',
    group_id: 1,
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

const timeLineList = ref<TimeLineItem[]>([])

const emits = defineEmits(['revise'])

const handleClickReviseButton = () => {
  emits('revise')
}

const scrollbarRef = ref<InstanceType<typeof ElScrollbar> | null>(null)

const handleScroll = () => {}

const handleMouseWheel = () => {}

const isEdit = computed(() => {
  return userStore.userInfo.group_id === props.data.group_id
})

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
      <el-button
        :color="colorStore.themeColor"
        v-if="isEdit"
        size="large"
        width="100%"
        plain
        @click="handleClickReviseButton"
        :icon="Edit"
        >修改</el-button
      >
      <el-divider></el-divider>
      <el-scrollbar
        v-if="timeLineList.length > 0"
        max-height="400px"
        style="position: relative"
        ref="scrollbarRef"
        @scroll="handleScroll"
        @mousewheel.stop="handleMouseWheel"
      >
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
      </el-scrollbar>
      <el-empty v-else description="暂无同学总结观点..."></el-empty>
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
</style>
