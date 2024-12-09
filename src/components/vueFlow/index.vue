<script setup lang="ts">
import { VueFlow, Panel, useVueFlow, Position } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { MiniMap } from '@vue-flow/minimap'
import '@vue-flow/minimap/dist/style.css'
import { Controls } from '@vue-flow/controls'
import '@vue-flow/controls/dist/style.css'
import { nextTick } from 'vue'
import topicNode from './components/topicNode/index.vue'
import groupNode from './components/groupNode/index.vue'
import InteractionNode from './components/InteractionNode/index.vue'
import useRequest from '@/hooks/Async/useRequest'
import useQueryParam from '@/hooks/router/useQueryParam'
import { EDGE_COLORS } from './option'
import type { LayoutDir } from './type'
import { useLayout } from '@/hooks/VueFlow/useLayout'
import { getGroupNodeId } from './utils'
// import { useNotification } from './hook'
import { useUserStore } from '@/store/modules/user/index.ts'
import useState from '@/hooks/State/useState.ts'
import eventBus from '@/hooks/eventBus'
import ViewPointAPI from '@/apis/viewpoint'
import {
  GetViewPointListResponse,
  Node,
  Edge,
  NotResponsed,
} from '@/apis/viewpoint/interface'

/**
 * WARNING: 设置nodes和edges状态时在一个函数内最好只更新一次
 * 不要在一个函数内更新多次
 * 否则会引起BUG！！
 */

defineOptions({
  option: 'flow-component',
  name: 'MyVueFlow',
})

const props = withDefaults(
  defineProps<{
    updateVueFlowEffects?: () => void
    onMountedEffect?: () => void
    onUpdateValues?: (args: {
      nodes: Node[]
      edges: Edge[]
      notResponsed: NotResponsed[]
    }) => void
    centerId: string
  }>(),
  {
    updateVueFlowEffects: () => {},
    onMountedEffect: () => {},
    onUpdateValues: () => {},
    centerId: '',
  }
)

onMounted(() => {
  props.onMountedEffect && props.onMountedEffect()
})

const {
  fitView,
  onNodesChange,
  onEdgesChange,
  applyNodeChanges,
  applyEdgeChanges,
} = useVueFlow()

// 禁止删除节点
onNodesChange(async changes => {
  const nextChanges = changes.filter(change => change.type !== 'remove')
  if (nextChanges.length === 0) return
  applyNodeChanges(nextChanges)
})

// 禁止删除边
onEdgesChange(async changes => {
  const nextChanges = changes.filter(change => change.type !== 'remove')
  if (nextChanges.length === 0) return
  applyEdgeChanges(nextChanges)
})

const topicId = useQueryParam<number>('topic_id')

const { getOneUserInfo } = useUserStore()

const student_id = getOneUserInfo<string>('id')
const group_id = getOneUserInfo<string>('group_id')

// const { setHighlightNotification } = useNotification()

const stateFormatter = (data: GetViewPointListResponse) => {
  return {
    nodes: data.nodes.map(node => {
      return {
        ...node,
        data: {
          ...node.data,
          sourcePosition: Position.Top,
          targetPosition: Position.Bottom,
        },
      }
    }),
    edges: data.edges.map(edge => {
      const strokeColor = EDGE_COLORS[edge._type]
      return {
        ...edge,
        style: {
          stroke: strokeColor,
        },
      }
    }),
    notResponsed: data.notResponsed,
  }
}
interface VueFlowEdge extends Edge {
  style: {
    stroke: string
  }
}
const [nodes, setNodes] = useState<Node[]>([])

const [edges, setEdges] = useState<VueFlowEdge[]>([])

const { loading, run } = useRequest({
  apiFn: async () => {
    return ViewPointAPI.getViewPointList({
      topic_id: topicId.value,
      student_id: Number(student_id),
    })
  },
  onSuccess: (data: {
    nodes: Node[]
    edges: VueFlowEdge[]
    notResponsed: NotResponsed[]
  }) => {
    console.log('queryFlowDataApidata', data)
    setNodes(data.nodes)
    setEdges(data.edges)
    props.updateVueFlowEffects && props.updateVueFlowEffects()
    props.onUpdateValues &&
      props.onUpdateValues({
        nodes: data.nodes,
        edges: data.edges,
        notResponsed: data.notResponsed,
      })
  },
  onFail: () => {},
  formatter: stateFormatter,
  onFinally: () => {
    setFitView()
  },
  immediate: true,
})

/**
 * init flow data
 */

const { layout } = useLayout()

const handleLayout = async (direction: LayoutDir) => {
  const sourcePosition = direction === 'LR' ? Position.Right : Position.Bottom
  const targetPosition = direction === 'LR' ? Position.Left : Position.Top
  let nodesValue = [...nodes.value]
  let edgesValue = [...edges.value]

  nodesValue.forEach(node => {
    node.data.sourcePosition = sourcePosition
    node.data.targetPosition = targetPosition
  })
  console.log('props.centerId', props.centerId)
  const centerNodeId = props.centerId || getGroupNodeId(nodesValue, +group_id)
  // 查找团队节点

  nodesValue = layout(nodesValue, edgesValue, direction)

  setNodes(nodesValue)
  setEdges(edgesValue)
  // console.log('vueFlowed centerNodeId 1', centerNodeId)
  await nextTick(() => {
    setTimeout(() => {
      if (centerNodeId) {
        // console.log('vueFlowed centerNodeId 2', centerNodeId)
        setFitViewOnNodeCenter(centerNodeId)
      } else {
        fitView()
      }
    }, 10)
  })
}

const setFitView = () => {
  setTimeout(() => {
    handleLayout('TB')
  }, 50)
}

/**
 * expose a function to get the nodes and edges
 */
const getState = () => {
  return {
    nodes: nodes.value,
    edges: edges.value,
  }
}
/**
 *
 * @param id
 * 发布订阅模式，发出信号，子组件接收到后执行相应情况
 */
const publishMessage = (id: string) => {
  eventBus.emit('animate', id)
}

const setFitViewOnNodeCenter = (id: string) => {
  fitView({
    nodes: [id],
  })
  publishMessage(id)
}
defineExpose({
  handleLayout,
  refreshData: () => {
    run()
  },
  getState,
  setFitViewOnNodeCenter,
})
</script>

<template>
  <div class="layout-flow" style="width: 100vw; height: 100vh">
    <!-- flow -->
    <VueFlow
      :nodes="nodes"
      :edges="edges"
      v-if="!loading"
      :apply-default="false"
    >
      <!-- bind your custom node type to a component by using slots, slot names are always `node-<type>` -->
      <template #node-topic="props">
        <topicNode :data="props.data" v-bind="$attrs" />
      </template>
      <template #node-group="props">
        <groupNode :data="props.data" v-bind="$attrs" />
      </template>
      <template #node-idea="props">
        <InteractionNode :data="props.data" v-bind="$attrs" />
      </template>
      <template #node-agree="props">
        <InteractionNode :data="props.data" v-bind="$attrs"></InteractionNode>
      </template>
      <template #node-disagree="props">
        <InteractionNode :data="props.data" v-bind="$attrs"></InteractionNode>
      </template>
      <template #node-ask="props">
        <InteractionNode :data="props.data" v-bind="$attrs"></InteractionNode>
      </template>
      <template #node-response="props">
        <InteractionNode :data="props.data" v-bind="$attrs"></InteractionNode>
      </template>

      <Background
        :variant="'lines'"
        :size="200"
        patternColor="#fff"
        :gap="180"
      />

      <MiniMap pannable zoomable />

      <Controls />

      <!-- 提供一个右上角的插槽 -->
      <Panel class="process-panel" position="top-right">
        <slot name="top-right"></slot>
      </Panel>

      <!-- 提供一个左上角的插槽 -->
      <Panel class="process-panel" position="top-left">
        <slot name="top-left"></slot>
      </Panel>
    </VueFlow>
    <!-- loader -->
    <div class="loader" v-else></div>
  </div>
</template>

<style>
/* import the necessary styles for Vue Flow to work */
@import '@vue-flow/core/dist/style.css';

/* import the default theme, this is optional but generally recommended */
@import '@vue-flow/core/dist/theme-default.css';
/* HTML: <div class="loader"></div> */
.loader {
  width: 45px;
  aspect-ratio: 1;
  --c: no-repeat linear-gradient(#000 0 0);
  background: var(--c) 0% 50%, var(--c) 50% 50%, var(--c) 100% 50%;
  background-size: 20% 100%;
  animation: l1 1s infinite linear;
}
@keyframes l1 {
  0% {
    background-size: 20% 100%, 20% 100%, 20% 100%;
  }
  33% {
    background-size: 20% 10%, 20% 100%, 20% 100%;
  }
  50% {
    background-size: 20% 100%, 20% 10%, 20% 100%;
  }
  66% {
    background-size: 20% 100%, 20% 100%, 20% 10%;
  }
  100% {
    background-size: 20% 100%, 20% 100%, 20% 100%;
  }
}
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
