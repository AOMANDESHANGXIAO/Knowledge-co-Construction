<script setup lang="ts">
import {
  VueFlow,
  Panel,
  useVueFlow,
  Position,
  useNodesInitialized,
} from '@vue-flow/core'
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

import { LayoutDirection, VueFlowNode, VueFlowEdge, NodeType } from './type.ts'

defineOptions({
  group_name: 'flow-component',
})

// FIXME: 解决layout定位失败的原因
// 已解决

const { onPaneReady } = useVueFlow()

const lineNormalColor = useCssVar('--normal-line-color')
const lineApproveColor = useCssVar('--approve-line-color')
const lineOpposeColor = useCssVar('--oppose-line-color')

// =======查询节点数据和边的数据逻辑==========
const nodes = ref<VueFlowNode[]>([
  // // an input node, specified by using `type: 'input'`
  // {
  //   id: '1',
  //   type: NodeType.Topic,
  //   label: 'Node 4',
  //   position,
  //   data: {
  //     text: '人工智能技术应当如何被应用于教学当中?',
  //   },
  // },
  // {
  //   id: '2',
  //   type: NodeType.Group,
  //   label: 'Node 3',
  //   position,
  //   data: {
  //     groupName: '小组B',
  //     groupConclusion:
  //       '人工智能在教学中的应用旨在提升教育的质量与效率，增强个性化学习体验，并支持教育工作者进行更有效的教学管理和决策。以下是一些关键的应用方式：\n' +
  //       '个性化学习路径：通过分析学生的学习习惯、进度和能力，AI可以定制个性化的学习计划，推荐适合每个学生的教育资源和练习，以适应他们的学习速度和风格。\n' +
  //       '智能辅导系统：利用自然语言处理和机器学习技术，AI可以作为虚拟助教，解答学生的问题，提供即时反馈，甚至进行对话式学习辅导，帮助学生深化理解。\n' +
  //       '智能组卷与阅卷：自动根据课程大纲和学生掌握情况生成个性化试卷，并通过图像识别和自然语言理解技术自动批改客观题，减轻教师负担，同时提供详细的评估报告。\n' +
  //       '学习成效预测与干预：通过分析大量学习数据，AI能够预测学生的学习成果，识别潜在的学习困难，及时向教师或学生本人发出预警，采取干预措施，预防学业滑坡。\n' +
  //       '课堂互动增强：利用语音识别、面部识别等技术，AI可以监测课堂参与度，分析学生的情绪反应，帮助教师调整教学策略，使课堂更加生动和互动。\n' +
  //       '教育管理与资源配置：AI可以优化学校管理，如通过数据分析优化课程安排、教室分配和资源调度，以及利用人脸识别技术进行考勤管理，提高管理效率。\n' +
  //       '辅助特殊教育：对于有特殊需求的学生，AI可以提供定制化的学习材料和交互方式，比如使',
  //   },
  // },
  // {
  //   id: '3',
  //   type: NodeType.Group,
  //   label: 'Node 3',
  //   position,
  //   data: {
  //     groupName: '小组C',
  //     groupConclusion:
  //       '人工智能在教学中的应用旨在提升教育的质量与效率，增强个性化学习体验，并支持教育工作者进行更有效的教学管理和决策。以下是一些关键的应用方式：\n' +
  //       '个性化学习路径：通过分析学生的学习习惯、进度和能力，AI可以定制个性化的学习计划，推荐适合每个学生的教育资源和练习，以适应他们的学习速度和风格。\n' +
  //       '智能辅导系统：利用自然语言处理和机器学习技术，AI可以作为虚拟助教，解答学生的问题，提供即时反馈，甚至进行对话式学习辅导，帮助学生深化理解。\n' +
  //       '智能组卷与阅卷：自动根据课程大纲和学生掌握情况生成个性化试卷，并通过图像识别和自然语言理解技术自动批改客观题，减轻教师负担，同时提供详细的评估报告。\n' +
  //       '学习成效预测与干预：通过分析大量学习数据，AI能够预测学生的学习成果，识别潜在的学习困难，及时向教师或学生本人发出预警，采取干预措施，预防学业滑坡。\n' +
  //       '课堂互动增强：利用语音识别、面部识别等技术，AI可以监测课堂参与度，分析学生的情绪反应，帮助教师调整教学策略，使课堂更加生动和互动。\n' +
  //       '教育管理与资源配置：AI可以优化学校管理，如通过数据分析优化课程安排、教室分配和资源调度，以及利用人脸识别技术进行考勤管理，提高管理效率。\n' +
  //       '辅助特殊教育：对于有特殊需求的学生，AI可以提供定制化的学习材料和交互方式，比如使',
  //   },
  // },
  // {
  //   id: '4',
  //   type: NodeType.Group,
  //   label: 'Node 3',
  //   position,
  //   data: {
  //     groupName: '小组A',
  //     groupConclusion:
  //       '人工智能在教学中的应用旨在提升教育的质量与效率，增强个性化学习体验，并支持教育工作者进行更有效的教学管理和决策。以下是一些关键的应用方式：\n' +
  //       '个性化学习路径：通过分析学生的学习习惯、进度和能力，AI可以定制个性化的学习计划，推荐适合每个学生的教育资源和练习，以适应他们的学习速度和风格。\n' +
  //       '智能辅导系统：利用自然语言处理和机器学习技术，AI可以作为虚拟助教，解答学生的问题，提供即时反馈，甚至进行对话式学习辅导，帮助学生深化理解。\n' +
  //       '智能组卷与阅卷：自动根据课程大纲和学生掌握情况生成个性化试卷，并通过图像识别和自然语言理解技术自动批改客观题，减轻教师负担，同时提供详细的评估报告。\n' +
  //       '学习成效预测与干预：通过分析大量学习数据，AI能够预测学生的学习成果，识别潜在的学习困难，及时向教师或学生本人发出预警，采取干预措施，预防学业滑坡。\n' +
  //       '课堂互动增强：利用语音识别、面部识别等技术，AI可以监测课堂参与度，分析学生的情绪反应，帮助教师调整教学策略，使课堂更加生动和互动。\n' +
  //       '教育管理与资源配置：AI可以优化学校管理，如通过数据分析优化课程安排、教室分配和资源调度，以及利用人脸识别技术进行考勤管理，提高管理效率。\n' +
  //       '辅助特殊教育：对于有特殊需求的学生，AI可以提供定制化的学习材料和交互方式，比如使',
  //   },
  // },
  // //   模拟几个学生的观点节点，指向小组节点
  // {
  //   id: 'idea1',
  //   type: NodeType.Idea,
  //   position,
  //   data: { name: 'Jack', id: 'idea1' },
  // },
  // {
  //   id: 'idea2',
  //   type: NodeType.Idea,
  //   position,
  //   data: { name: 'Tom', id: 'idea2' },
  // },
  // {
  //   id: 'idea3',
  //   type: NodeType.Idea,
  //   position,
  //   data: { name: 'Jerry', id: 'idea3' },
  // },
  // {
  //   id: 'idea4',
  //   type: NodeType.Idea,
  //   position,
  //   data: { name: 'Mary', id: 'idea4' },
  // },
  // {
  //   id: 'idea5',
  //   type: NodeType.Idea,
  //   position,
  //   data: { name: 'Lucy', id: 'idea5' },
  // },
  // {
  //   id: 'idea6',
  //   type: NodeType.Idea,
  //   position,
  //   data: { name: 'Lily', id: 'idea6' },
  // },
])

//
const edges = ref<VueFlowEdge[]>([
  // {
  //   id: 'e1-2',
  //   source: '2',
  //   target: '1',
  //   animated: true,
  //   style: { stroke: lineNormalColor },
  // },
  // {
  //   id: 'e2-2',
  //   source: '3',
  //   target: '1',
  //   animated: true,
  //   style: { stroke: lineNormalColor },
  // },
  // {
  //   id: 'e2-3',
  //   source: '4',
  //   target: '1',
  //   animated: true,
  //   style: { stroke: lineNormalColor },
  // },
  // {
  //   id: 'lianjie1',
  //   source: 'idea1',
  //   target: '2',
  //   animated: true,
  //   style: { stroke: lineNormalColor },
  // },
  // {
  //   id: 'lianjie2',
  //   source: 'idea2',
  //   target: '2',
  //   animated: true,
  //   style: { stroke: lineNormalColor },
  // },
  // {
  //   id: 'lianjie3',
  //   source: 'idea3',
  //   target: '3',
  //   animated: true,
  //   style: { stroke: lineNormalColor },
  // },
  // {
  //   id: 'lianjie4',
  //   source: 'idea4',
  //   target: 'idea1',
  //   animated: true,
  //   style: { stroke: lineOpposeColor },
  // },
  // {
  //   id: 'lianjie5',
  //   source: 'idea5',
  //   target: '3',
  //   animated: true,
  //   style: { stroke: lineNormalColor },
  // },
  // {
  //   id: 'lianjie6',
  //   source: 'idea6',
  //   target: '4',
  //   animated: true,
  //   style: { stroke: lineNormalColor },
  // },
])

const router = useRouter()

async function drawFlow(newNodes: VueFlowNode[], newEdges: VueFlowEdge[]) {
  nodes.value = [...newNodes]
  edges.value = [...newEdges]

  await nextTick(() => {
    layoutGraph(LayoutDirection.Vertical)
  })
}

const queryFlowData = (callback: Function = () => {}) => {
  const topic_id = router.currentRoute.value.query?.topic_id as unknown as
    | number
    | undefined
  console.log(topic_id)
  if (!topic_id) return
  queryFlowDataApi(topic_id)
    .then(res => {
      const data = res.data

      if (data.success) {
        nodes.value = data.data.nodes
        edges.value = data.data.edges
        callback()
      }
      console.log(res)
    })
    .catch(err => {
      console.log(err)
    })
}

onPaneReady(() => {
  if (nodes.value.length && edges.value.length) {
    console.log('绘制')
    console.log(nodes.value, edges.value)
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
    fitView()
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

const emits = defineEmits(['reply-approve', 'reply-oppose'])

const handleReplyApprove = (data: any) => {
  emits('reply-approve', data)
}

const handleReplyOppose = (data: any) => {
  emits('reply-oppose', data)
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
        <groupNode :data="props.data" />
      </template>
      <template #node-idea="props">
        <ideaNode
          :data="props.data"
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
