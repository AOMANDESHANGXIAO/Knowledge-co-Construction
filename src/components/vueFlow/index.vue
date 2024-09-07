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
import ideaNode from './components/ideaNode/index.vue'
import { queryFlowDataApi } from '@/apis/flow/index.ts'
import useRequest from '@/hooks/Async/useRequest'
import { QueryFlowResponse } from '@/apis/flow/type'
import useQueryParam from '@/hooks/router/useQueryParam'
import { EDGE_COLORS } from './option'
import type { Node, Edge, LayoutDir } from './type'
import { useLayout } from '@/hooks/VueFlow/useLayout'
import { getStuNodeIds, getGroupNodeId } from './utils'
import { useNotification } from './hook'
import { useUserStore } from '@/store/modules/user/index.ts'
import useState from '@/hooks/State/useState.ts'

/**
 * WARNING: 设置nodes和edges状态时在一个函数内最好只更新一次
 * 不要在一个函数内更新多次
 * 否则会引起BUG！！
 */

defineOptions({
  option: 'flow-component',
  name: 'MyVueFlow',
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

const { setHighlightNotification } = useNotification()

const stateFormatter = (data: QueryFlowResponse) => {
  return {
    nodes: data.nodes.map(node => {
      if (node.type === 'idea') {
        const { data } = node
        return {
          ...node,
          data: {
            name: data.name,
            id: String(data.id),
            bgc: data.bgc,
            student_id: String(data.student_id),
            highlight: false,
            targetPosition: Position.Top,
            sourcePosition: Position.Bottom,
          },
        }
      } else if (node.type === 'group') {
        return {
          ...node,
          data: {
            groupName: node.data.groupName,
            groupConclusion: node.data.groupConclusion,
            bgc: node.data.bgc,
            group_id: node.data.group_id,
            node_id: node.data.node_id,
            targetPosition: Position.Top,
            sourcePosition: Position.Bottom,
          },
        }
      } else {
        return {
          ...node,
          data: {
            text: node.data.text,
            sourcePosition: Position.Top,
            targetPosition: Position.Bottom,
          },
        }
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
  }
}

const { loading, run } = useRequest({
  apiFn: async () => {
    return await queryFlowDataApi(topicId.value)
  },
  onSuccess: (data: { nodes: Node[]; edges: Edge[] }) => {
    setNodes(data.nodes)
    setEdges(data.edges)
  },
  onFail: () => {},
  formatter: stateFormatter,
  onFinally: () => {
    setFitView()
  },
})

const [nodes, setNodes] = useState<Node[]>([])

const [edges, setEdges] = useState<Edge[]>([])

/**
 * init flow data
 */
run()

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
  // 查询是否有回复自己的
  const stuNodeIds = getStuNodeIds(nodesValue, student_id)

  const positionNodes: { nodes: string[] } = { nodes: [] }

  if (stuNodeIds.length) {
    nodesValue = setHighlightNotification(edgesValue, student_id, nodesValue)
    positionNodes.nodes = stuNodeIds
  } else {
    // 查找团队节点
    const groupNodeId = getGroupNodeId(nodesValue, +group_id)

    if (groupNodeId) {
      positionNodes.nodes = [groupNodeId]
    }
  }

  nodesValue = layout(nodesValue, edgesValue, direction)

  setNodes(nodesValue)
  setEdges(edgesValue)

  await nextTick(() => {
    setTimeout(() => {
      if (positionNodes.nodes.length) {
        fitView(positionNodes)
      } else {
        fitView()
      }
    }, 100)
  })
}

const setFitView = () => {
  setTimeout(() => {
    console.log('set Fit View')
    handleLayout('TB')
  }, 100)
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

defineExpose({
  handleLayout,
  refreshData: () => {
    run()
  },
  getState,
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
        <topicNode :data="props.data" />
      </template>
      <template #node-group="props">
        <!-- <groupNode :data="props.data" @click="onClickGroupNode" /> -->
        <groupNode :data="props.data" v-bind="$attrs" />
      </template>
      <template #node-idea="props">
        <ideaNode :data="props.data" v-bind="$attrs" />
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
