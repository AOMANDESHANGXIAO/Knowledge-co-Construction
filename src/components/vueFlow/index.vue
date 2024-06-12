<script setup lang="ts">
import {VueFlow, Panel, useVueFlow} from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import Icon from '@/components/Icon/flowIcon.vue'
import { ref, nextTick } from 'vue'
import topicNode from '@/components/Node/topicNode.vue'
import groupNode from '@/components/Node/groupNode.vue'
import { useLayout } from '@/hooks/VueFlow/useLayout'

defineOptions({
  name: 'flow-component'
})

const nodes = ref([ // an input node, specified by using `type: 'input'`
  { id: '4', label: 'Node 1', position: { x: 250, y: 5 } },

  // default node, you can omit `type: 'default'` as it's the fallback type
  { id: '2', label: 'Node 2', position: { x: 100, y: 100 }, },

  // An output node, specified by using `type: 'output'`
  { id: '3', label: 'Node 3', position: { x: 400, y: 200 } },

  { id: '5', type: 'group', label: 'Node 3', position: { x: 900, y: 200 }, data: {
      groupName:'小组B',
      groupConclusion:'人工智能在教学中的应用旨在提升教育的质量与效率，增强个性化学习体验，并支持教育工作者进行更有效的教学管理和决策。以下是一些关键的应用方式：\n' +
          '个性化学习路径：通过分析学生的学习习惯、进度和能力，AI可以定制个性化的学习计划，推荐适合每个学生的教育资源和练习，以适应他们的学习速度和风格。\n' +
          '智能辅导系统：利用自然语言处理和机器学习技术，AI可以作为虚拟助教，解答学生的问题，提供即时反馈，甚至进行对话式学习辅导，帮助学生深化理解。\n' +
          '智能组卷与阅卷：自动根据课程大纲和学生掌握情况生成个性化试卷，并通过图像识别和自然语言理解技术自动批改客观题，减轻教师负担，同时提供详细的评估报告。\n' +
          '学习成效预测与干预：通过分析大量学习数据，AI能够预测学生的学习成果，识别潜在的学习困难，及时向教师或学生本人发出预警，采取干预措施，预防学业滑坡。\n' +
          '课堂互动增强：利用语音识别、面部识别等技术，AI可以监测课堂参与度，分析学生的情绪反应，帮助教师调整教学策略，使课堂更加生动和互动。\n' +
          '教育管理与资源配置：AI可以优化学校管理，如通过数据分析优化课程安排、教室分配和资源调度，以及利用人脸识别技术进行考勤管理，提高管理效率。\n' +
          '辅助特殊教育：对于有特殊需求的学生，AI可以提供定制化的学习材料和交互方式，比如使'
    } },

  // A custom node, specified by using a custom type name
  // we choose `type: 'special'` for this example
  {
    id: '1',
    type: 'special',
    label: 'Node 4',
    position: { x: 800, y: 200 },

    // pass custom data to the node
    data: {
      // you can pass any data you want to the node
      text: '人工智能技术应当如何被应用于教学当中?',
    },
  },])

const edges = ref([
  // nodes



  // edges

  // simple default bezier edge
  // consists of an id, source-id and target-id
  { id: 'e1-3', source: '1', target: '3' },

  // an animated edge, specified by using `animated: true`
  { id: 'e1-2', source: '1', target: '2', animated: true, style: { stroke: '#10b981' } },
  { id: 'e1-4', source: '1', target: '4', animated: false },

  // a custom edge, specified by using a custom type name
  // we choose `type: 'special'` for this example
  // {
  //   id: 'e1-4',
  //   type: 'special',
  //   source: '1',
  //   target: '4',
  //
  //   // pass custom data to the edge
  //   data: {
  //     // You can pass any data you want to the edge
  //     hello: 'world',
  //   }
  // },
])

// const shuffle = useShuffle()

const { layout } = useLayout()

const { fitView } = useVueFlow()

// async function shuffleGraph() {
//   // await stop()
//
//   // reset(nodes.value)
//
//   edges.value = shuffle(nodes.value)
//
//   await nextTick(() => {
//     layoutGraph(previousDirection.value)
//   })
// }

async function layoutGraph(direction) {
  // await stop()

  // reset(nodes.value)

  nodes.value = layout(nodes.value, edges.value, direction)

  await nextTick(() => {
    fitView()
  })
}
</script>

<template>
  <VueFlow :nodes="nodes" :edges="edges">
    <!-- bind your custom node type to a component by using slots, slot names are always `node-<type>` -->
    <template #node-special="props">
      <topicNode :data="props.data"/>
    </template>
    <template #node-group="props">
      <groupNode :data="props.data"/>
    </template>

    <Background :bg-color="'#1b1b1f'" :variant="'lines'" :size="20"/>

    <Panel class="process-panel" position="top-right">
      <div class="layout-panel">
        <button title="set horizontal layout" @click="layoutGraph('LR')">
          <Icon name="horizontal" />
        </button>
        <button title="set vertical layout" @click="layoutGraph('TB')">
          <Icon name="vertical" />
        </button>
<!--        <button title="shuffle graph" @click="shuffleGraph">-->
<!--          <Icon name="shuffle" />-->
<!--        </button>-->
      </div>
    </Panel>
  </VueFlow>
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