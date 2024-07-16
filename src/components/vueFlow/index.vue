<script setup lang="ts">
import { VueFlow, Panel, useVueFlow, Position } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { MiniMap } from '@vue-flow/minimap'
import '@vue-flow/minimap/dist/style.css'
import { Controls } from '@vue-flow/controls'
import '@vue-flow/controls/dist/style.css'
import { ref, nextTick } from 'vue'
import topicNode from '@/components/Node/topicNode/index.vue'
import groupNode from '@/components/Node/groupNode/index.vue'
import ideaNode from '@/components/Node/ideaNode/index.vue'
import { useLayout } from '@/hooks/VueFlow/useLayout'
import { useCssVar } from '@vueuse/core'
import { queryFlowDataApi } from '@/apis/flow/index.ts'
import { useRouter } from 'vue-router'
import { diffArr, getNotification } from '@/utils/diffHandler/index.ts'
import { useUserStore } from '@/store/modules/user'
import { LayoutDirection, VueFlowNode, VueFlowEdge, EdgeType } from './type.ts'

defineOptions({
  option: 'flow-component',
})

const { onPaneReady } = useVueFlow()

const lineNormalColor = useCssVar('--normal-line-color')
const lineApproveColor = useCssVar('--approve-line-color')
const lineOpposeColor = useCssVar('--oppose-line-color')

const lineColors = {
  group_to_discuss: lineNormalColor.value,
  idea_to_group: lineNormalColor.value,
  approve: lineApproveColor.value,
  reject: lineOpposeColor.value,
}

const DEFAULT_STROKE_COLOR = '#fff'

const handlerEdgesColor = (edges: VueFlowEdge[]) => {
  return edges.map(edge => {
    const color = lineColors[edge._type as EdgeType] || DEFAULT_STROKE_COLOR

    return { ...edge, style: { stroke: color } }
  })
}

// =======查询节点数据和边的数据逻辑==========
const nodes = ref<VueFlowNode[]>([])

const edges = ref<VueFlowEdge[]>([])

const router = useRouter()

async function drawFlow(newNodes: VueFlowNode[], newEdges: VueFlowEdge[]) {
  console.log('newNodes>>>>', newNodes)
  console.log('newEdges>>>>', newEdges)
  nodes.value = [...newNodes]
  edges.value = [...newEdges]
  edges.value = [...handlerEdgesColor(edges.value)]

  await nextTick(() => {
    layoutGraph(LayoutDirection.Vertical)
  })
}

/**
 * 定位到屏幕中心点的nodeIds
 */
const nodeIds = ref<string[]>([])

const groupNodeId = ref<string[]>([])

/**
 * @description 基于两次数组不同的地方，为学生设置提示
 */
const setReplyNotification = (data: any, resNodes: any) => {
  let node_id: any

  const newArr = diffArr(edges.value, data.data.edges)
  // console.log('the diff is', newArr)
  const userId = useUserStore().userInfo.id

  let notes
  if (newArr.length) {
    notes = getNotification(userId.toString(), resNodes, newArr)

    node_id = notes.map(note => note.source)
    // console.log(data.data.nodes, 'data.data.nodes')
    nodeIds.value = node_id
    ElNotification({
      title: '互动通知',
      message: '有' + notes.length + '人刚刚回复了你的观点, 去看看吧~',
      type: 'info',
      duration: 5000,
    })

    // 设置highlight
    const res = resNodes.map(node => {
      // console.log('node is ', node)
      if (node_id.includes(node.id)) {
        return {
          ...node,
          data: {
            ...node.data,
            highlight: true,
          },
        }
      }

      return node
    })
    // console.log('res', res)
    return res
  } else {
    return resNodes
  }
}

/**
 * @description 设置viewPort的中心点为groupConclusion
 */
const setGroupNodeAsViewPort = (resNodes: any) => {
  const groupId = useUserStore().userInfo.group_id as number
  // nodeIds.value =
  let groupNode
  console.log('2', resNodes)
  for (let i = 0; i < resNodes.length; i++) {
    if (resNodes[i].data.group_id === groupId && resNodes[i].type === 'group') {
      groupNode = resNodes[i]
      break
    }
  }
  groupNodeId.value = [groupNode.id]
}

/**
 * 
 * @param callback 刷新节点的回调
 * @description 这个函数有一个BUG，可以实现功能，最好不要动任何代码
 */
const queryFlowData = (callback: Function = () => {}) => {
  const topic_id = router.currentRoute.value.query?.topic_id as unknown as
    | number
    | undefined
  console.log(topic_id)
  if (!topic_id) return
  queryFlowDataApi(topic_id)
    .then(res => {
      const data: any = res
      let resNodes = JSON.parse(JSON.stringify(data.data.nodes))
      // console.log('1, resNodes', resNodes)
      if (!data.data.nodes) {
        console.log('Something bug there...')
        return
      }
      if (data.success) {
        nodeIds.value = []
        if (edges.value.length) {
          resNodes = setReplyNotification(data, resNodes)
          // console.log('3,resNodes', resNodes)
        }
        /**
         * 默认将viewPort的中心设置为本组的结论节点
         */
        if (!nodeIds.value.length && !groupNodeId.value.length) {
          // 如果没有消息提示，则将viewPort的中心设置为本组的结论节点
          setGroupNodeAsViewPort(resNodes)
        }
        // console.log('2, resNodes', resNodes)
        nodes.value = [...resNodes]
        edges.value = data.data.edges

        callback()
      }
    })
    .catch(err => {
      console.log(err)
    })
}

onPaneReady(() => {
  if (nodes.value.length && edges.value.length) {
    edges.value = handlerEdgesColor(edges.value)
    layoutGraph(LayoutDirection.Vertical)
  }
})

queryFlowData()

// =======================================
const { layout } = useLayout()

const { fitView } = useVueFlow()

async function layoutGraph(direction: LayoutDirection) {
  // 如果是上下排列的话要将nodes中的position属性做一个变换，将出去位置改为下
  // 将别人进来的位置改为上
  if (direction === LayoutDirection.Vertical) {
    nodes.value = nodes.value.map(node => {
      return {
        ...node,
        data: {
          ...node.data,
          sourcePosition: Position.Bottom,
          targetPosition: Position.Top,
        },
      }
    })
  } else if (direction === LayoutDirection.Horizontal) {
    nodes.value = nodes.value.map(node => {
      return {
        ...node,
        data: {
          ...node.data,
          sourcePosition: Position.Right,
          targetPosition: Position.Left,
        },
      }
    })
  }

  nodes.value = layout(nodes.value, edges.value, direction)

  await nextTick(() => {
    if (nodeIds.value.length) {
      // console.log('fitView1', { nodes: nodeIds.value })
      fitView({ nodes: nodeIds.value }).then(() => {
        /**
         * something bug here，have to use fitView twice...
         */
        fitView({ nodes: nodeIds.value })
      })
    } else if (groupNodeId.value.length) {
      // console.log('fitView2')
      fitView({ nodes: groupNodeId.value })
    } else {
      fitView()
    }
  })
}

function getNodesAndEdges() {
  return {
    nodes: nodes.value,
    edges: edges.value,
  }
}

const refresh = () => {
  // 刷新节点和边
  const callBack = () => {
    drawFlow(nodes.value, edges.value)
  }
  queryFlowData(callBack)
}

defineExpose({
  layoutGraph,
  drawFlow,
  getNodesAndEdges,
  refresh,
  lineNormalColor,
  lineApproveColor,
  lineOpposeColor,
})

const emits = defineEmits([
  'reply-approve',
  'reply-oppose',
  'revise',
  'revise-self',
])

const handleReplyApprove = (id: string) => {
  emits('reply-approve', id)
}

const handleReplyOppose = (id: string) => {
  emits('reply-oppose', id)
}
const handleEmitRevise = (payload: { content: string }) => {
  emits('revise', payload)
}
const handleReviseSelf = (payload: { id: string; content: string }) => {
  emits('revise-self', payload)
}
</script>

<template>
  <div class="layout-flow" style="width: 100vw; height: 100vh">
    <VueFlow :nodes="nodes" :edges="edges" v-if="nodes.length && edges.length">
      <!-- bind your custom node type to a component by using slots, slot names are always `node-<type>` -->
      <template #node-topic="props">
        <topicNode :data="props.data" />
      </template>
      <template #node-group="props">
        <groupNode :data="props.data" @revise="handleEmitRevise" />
      </template>
      <template #node-idea="props">
        <ideaNode
          :data="props.data"
          @revise-self="handleReviseSelf"
          @reply-approve="handleReplyApprove"
          @reply-oppose="handleReplyOppose"
        />
      </template>

      <Background
        :variant="'lines'"
        :size="200"
        patternColor="#fff"
        :gap="180"
      />

      <MiniMap pannable zoomable />

      <Controls />

      <Panel class="process-panel" position="top-right">
        <slot></slot>
      </Panel>
    </VueFlow>
  </div>
</template>

<style>
/* import the necessary styles for Vue Flow to work */
@import '@vue-flow/core/dist/style.css';

/* import the default theme, this is optional but generally recommended */
@import '@vue-flow/core/dist/theme-default.css';

.layout-flow {
  background-color: #1a192b;
  height: 100%;
  width: 100%;
}

.process-panel,
.layout-panel {
  display: flex;
  gap: 10px;
}

.process-panel {
  background-color: #2d3748;
  padding: 10px;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
}

.process-panel button {
  border: none;
  cursor: pointer;
  background-color: #4a5568;
  border-radius: 8px;
  color: white;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
}

.process-panel button {
  font-size: 16px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.checkbox-panel {
  display: flex;
  align-items: center;
  gap: 10px;
}

.process-panel button:hover,
.layout-panel button:hover {
  background-color: #2563eb;
  transition: background-color 0.2s;
}

.process-panel label {
  color: white;
  font-size: 12px;
}

.stop-btn svg {
  display: none;
}

.stop-btn:hover svg {
  display: block;
}

.stop-btn:hover .spinner {
  display: none;
}

.spinner {
  border: 3px solid #f3f3f3;
  border-top: 3px solid #2563eb;
  border-radius: 50%;
  width: 10px;
  height: 10px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
