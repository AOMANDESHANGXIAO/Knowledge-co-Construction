<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'
import { GroupNodeProps } from '@/components/vueFlow/components/groupNode/type.ts'
import { Refresh } from '@element-plus/icons-vue'
import { useUserStore } from '@/store/modules/user'
import ViewPointAPI from '@/apis/viewpoint'
import { GetInteractionResponse } from '@/apis/viewpoint/interface'
import useRequest from '@/hooks/Async/useRequest'
import { useMessage } from 'naive-ui'
import { InteractionNodeType } from '@/apis/viewpoint/interface'

defineOptions({
  name: 'groupNode',
})

interface Props {
  data: GroupNodeProps
}

const props = withDefaults(defineProps<Props>(), {
  data: () => {
    return {
      groupName: 'No Group Name',
      groupConclusion: '暂时没有讨论结果...',
      bgc: '#FFA62F',
      group_id: -1,
      node_id: '', // node_id
      sourcePosition: Position.Bottom, // 出来
      targetPosition: Position.Top, // 进来
    }
  },
})

const emits = defineEmits<{
  // 将group_id传给父组件
  (
    e: 'onClickGroupNode',
    payload: { groupId: string; nodeId: string; groupConclusion: string }
  ): void
  (
    e: 'onClickEditButton',
    payload: {
      id: string
      contentList: GetInteractionResponse['list']
      type: InteractionNodeType
      mode: 'post' | 'patch'
    }
  ): void
}>()

const handleClick = () => {
  emits('onClickGroupNode', {
    groupId: String(props.data.group_id),
    nodeId: String(props.data.node_id),
    groupConclusion: props.data.groupConclusion,
  })
}
const { getOneUserInfo } = useUserStore()
const groupId = getOneUserInfo<string>('group_id')
const studentId = getOneUserInfo<string>('id')
const isSelfGroup = computed(
  () => String(props.data.group_id) === String(groupId)
)
const contentList = ref<GetInteractionResponse['list']>([])
const message = useMessage()
const { run: getData, loading } = useRequest({
  apiFn: async () => {
    return ViewPointAPI.getGroup({
      id: Number(props.data.node_id),
      student_id: Number(studentId),
    })
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
const footerButton = computed(() => {
  const buttonOption = {
    text: '去总结',
    type: 'info',
    onClick() {
      /**
       * 首次总结小组观点
       */
      emits('onClickEditButton', {
        id: String(props.data.node_id),
        contentList: contentList.value,
        type: 'group',
        mode: 'post',
      })
    },
  }
  if (contentList.value.length > 0) {
    buttonOption.text = '去编辑'
    buttonOption.onClick = () => {
      /**
       * 编辑小组观点
       */
      emits('onClickEditButton', {
        id: String(props.data.node_id),
        contentList: contentList.value,
        type: 'group',
        mode: 'patch',
      })
    }
  }
  return buttonOption
})
</script>

<template>
  <n-popover trigger="click" :show-arrow="false" style="min-width: 300px">
    <template #trigger>
      <div
        class="container"
        @click="
          () => {
            getData()
          }
        "
      >
        <Handle type="target" :position="props.data.targetPosition" />
        <Handle type="source" :position="props.data.sourcePosition" />
        <div class="title" :style="{ backgroundColor: props.data.bgc }">
          {{ props.data.groupName }}
        </div>
        <div class="content" @click="handleClick">
          <el-text>{{
            props.data.groupConclusion || '暂时没有讨论结果...'
          }}</el-text>
        </div>
      </div>
    </template>
    <template #header>
      <div style="display: flex; align-items: center; position: relative">
        <div
          :style="{
            width: '10px',
            height: '20px',
            'background-color': props.data.bgc,
          }"
        ></div>
        <n-text
          strong
          depth="1"
          :style="{
            color: props.data.bgc,
            fontSize: '20px',
            marginLeft: '10px',
          }"
          >{{ props.data.groupName + '组的观点' }}
        </n-text>
        <n-button
          tertiary
          circle
          type="primary"
          :loading="loading"
          style="position: absolute; right: 10px"
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
    <!-- middle -->
    <div>
      <div
        v-if="contentList.length"
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
      <div style="width: 100%" v-else>
        <n-result
          status="warning"
          title="提示"
          description="还没有总结观点呢~"
        ></n-result>
      </div>
    </div>
    <template #footer v-if="isSelfGroup">
      <n-space justify="center">
        <n-button type="info" @click="footerButton.onClick">{{
          footerButton.text
        }}</n-button>
      </n-space>
    </template>
  </n-popover>
</template>

<style scoped>
.container {
  width: 180px;
  border-radius: 10px;
  background-color: #f3f7ec;
  position: relative;
  cursor: pointer;

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
