<script setup lang="ts">
import {VueFlow, Panel, useVueFlow, Position} from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { ref, nextTick } from 'vue'
import topicNode from '@/components/Node/topicNode.vue'
import groupNode from '@/components/Node/groupNode.vue'
import ideaNode from '@/components/Node/ideaNode.vue'
import { useLayout } from '@/hooks/VueFlow/useLayout'

defineOptions({
  name: 'flow-component'
})

const props = defineProps({
  nodes: {
    type: Array,
    required: true,
    default: () => ([])
  },
  edges: {
    type: Array,
    required: true,
    default: () => ([])
  }
})

const nodes = ref(props.nodes)

const edges = ref(props.edges)


const { layout } = useLayout()

const { fitView } = useVueFlow()

async function layoutGraph(direction: 'TB' | 'LR' = 'TB') {

  // 如果是上下排列的话要将nodes中的position属性做一个变换，将出去位置改为下
  // 将别人进来的位置改为上
  if(direction === 'TB') {
    nodes.value = nodes.value.map((node) => {
      return {
        ...node,
        data:{
          ...node.data,
          sourcePosition: Position.Bottom,
          targetPosition: Position.Top
        }
      }
    })
  } else {
    nodes.value = nodes.value.map((node) => {
      return {
        ...node,
        data:{
          ...node.data,
          sourcePosition: Position.Right,
          targetPosition: Position.Left
        }
      }
    })
  }


  nodes.value = layout(nodes.value, edges.value, direction)

  await nextTick(() => {
    fitView()
  })
}

const { onPaneReady } = useVueFlow()
onPaneReady(() => {
  layoutGraph('TB')
})

defineExpose({
  layoutGraph
})
</script>

<template>
  <div class="layout-flow">
    <VueFlow :nodes="nodes" :edges="edges">
      <!-- bind your custom node type to a component by using slots, slot names are always `node-<type>` -->
      <template #node-special="props">
        <topicNode :data="props.data"/>
      </template>
      <template #node-group="props">
        <groupNode :data="props.data"/>
      </template>
      <template #node-idea="props">
        <ideaNode :data="props.data"/>
      </template>

      <Background  :variant="'lines'" :size="200" patternColor="#fff" :gap="180"/>

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