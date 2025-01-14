<script setup lang="ts">
import {VueFlow, Panel, useVueFlow, Position} from '@vue-flow/core'
import {Background} from '@vue-flow/background'
import {MiniMap} from '@vue-flow/minimap'
import '@vue-flow/minimap/dist/style.css'
import {Controls} from '@vue-flow/controls'
import '@vue-flow/controls/dist/style.css'
import {nextTick} from 'vue'
import topicNode from './components/topicNode/index.vue'
import groupNode from './components/groupNode/index.vue'
import InteractionNode from './components/InteractionNode/index.vue'
import useRequest from '@/hooks/useRequest.ts'
import useQueryParam from '@/hooks/useQueryParam.ts'
import {EDGE_COLORS} from './option'
import type {LayoutDir} from './type'
import {useLayout} from '@/hooks/useLayout.ts'
import {getGroupNodeId} from './utils'
import {useUserStore} from '@/store/useUserStore.ts'
import useState from '@/hooks/useState.ts'
import eventBus from '@/hooks/useEventBus.ts'
import ViewPointAPI from '@/apis/viewpoint'
import {
  GetViewPointListResponse,
  Node,
  Edge,
  NotResponsed,
} from '@/apis/viewpoint/interface'

defineOptions({
  name: 'ViewPointTree',
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
      updateVueFlowEffects: () => {
      },
      onMountedEffect: () => {
      },
      onUpdateValues: () => {
      },
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

const {getOneUserInfo} = useUserStore()

const student_id = getOneUserInfo<string>('id')
const group_id = getOneUserInfo<string>('group_id')

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

const {loading, run} = useRequest({
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
  onFail: () => {
  },
  formatter: stateFormatter,
  onFinally: () => {
    setFitView()
  },
  immediate: true,
})

/**
 * init flow data
 */

const {layout} = useLayout()

const handleLayout = async (direction: LayoutDir) => {
  const sourcePosition = direction === 'LR' ? Position.Right : Position.Bottom
  const targetPosition = direction === 'LR' ? Position.Left : Position.Top
  let nodesValue = [...nodes.value]
  let edgesValue = [...edges.value]

  nodesValue.forEach(node => {
    node.data.sourcePosition = sourcePosition
    node.data.targetPosition = targetPosition
  })
  const centerNodeId = props.centerId || getGroupNodeId(nodesValue, +group_id)

  nodesValue = layout(nodesValue, edgesValue, direction)

  setNodes(nodesValue)
  setEdges(edgesValue)
  await nextTick(() => {
    setTimeout(() => {
      if (centerNodeId) {
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
/**
 * vueFlow插槽列表
 */
const vueFlowSlotsList = [
  {
    name: 'node-topic',
    component: topicNode
  }, {
    name: 'node-group',
    component: groupNode
  }, {
    name: 'node-idea',
    component: InteractionNode
  }, {
    name: 'node-agree',
    component: InteractionNode
  }, {
    name: 'node-disagree',
    component: InteractionNode
  }, {
    name: 'node-ask',
    component: InteractionNode
  }, {
    name: 'node-response',
    component: InteractionNode
  }
]
</script>

<template>
  <div class="layout-flow">
    <!-- vueflow是第三方组件，官方文档查阅: https://vueflow.dev/ -->
    <VueFlow
        :nodes="nodes"
        :edges="edges"
        :apply-default="false"
    >

      <template v-for="(item,index) in vueFlowSlotsList" :key="index" #[item.name]="props">
        <component :is="item.component" :data="props.data" v-bind="$attrs"/>
      </template>

      <Background
          :variant="'lines'"
          :size="200"
          patternColor="#fff"
          :gap="180"
      />

      <MiniMap pannable zoomable/>

      <Controls/>

      <!-- 右上角插槽 -->
      <Panel class="process-panel" position="top-right">
        <slot name="top-right"></slot>
      </Panel>

      <!-- 左上角插槽 -->
      <Panel class="process-panel" position="top-left">
        <slot name="top-left"></slot>
      </Panel>
    </VueFlow>
  </div>
</template>

<style>
/* import the necessary styles for Vue Flow to work */
@import '@vue-flow/core/dist/style.css';

/* import the default theme, this is optional but generally recommended */
@import '@vue-flow/core/dist/theme-default.css';

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
  height: 100vh;
  width: 100vw;
}

.process-panel {
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


@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
