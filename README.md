# Vue 3 + TypeScript + Vite

This template should help get you started developing with Vue 3 and TypeScript in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

## Recommended Setup

- [VS Code](https://code.visualstudio.com/) + [Vue - Official](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (previously Volar) and disable Vetur

- Use [vue-tsc](https://github.com/vuejs/language-tools/tree/master/packages/tsc) for performing the same type checking from the command line, or for generating d.ts files for SFCs.

# 在这里简单的做一个项目笔记

原本打算使用蚂蚁的ant X6来制作流程图。
试了一圈发现各种bug比较难用，遂改变技术栈使用`vue-flow`来制作流程图。以下是使用`vue-flow`中的一点笔记。

## element
vue-flow中的element就是指的边(Node)和节点(Edge)。

可以使用一个数组将边和节点都包含进去。
对于点来说，配置项可以是。
``` js
{  id: '1',
   type: 'input', 
   label: 'Node 1',
   position: { x: 250, y: 5 } // 后面可以使用自动布局
},
```
对于边来说，配置项可以是.
``` js
{
id: 'e1-4', source: '1', target: '4', animated: true,
}
```
source指定从哪里指， target指定到哪里指。animated表示是否需要动画效果。
我们可以将边和节点放置在一个element数组中。然后通过v-model的方式，将其传到vue-flow中。
```vue
<script setup>
  import { VueFlow } from '@vue-flow/core'

  import SpecialNode from '@/components/Node/topicNode.vue'

  const elements = ref([
    // nodes

    // an input node, specified by using `type: 'input'`
    { id: '1', type: 'input', label: 'Node 1', position: { x: 250, y: 5 } },

    // default node, you can omit `type: 'default'` as it's the fallback type
    { id: '2', label: 'Node 2', position: { x: 100, y: 100 }, },

    // An output node, specified by using `type: 'output'`
    { id: '3', type: 'output', label: 'Node 3', position: { x: 400, y: 200 } },

    // A custom node, specified by using a custom type name
    // we choose `type: 'special'` for this example
    {
      id: '4',
      type: 'special',
      label: 'Node 4',
      position: { x: 400, y: 200 },

      // pass custom data to the node
      data: {
        // you can pass any data you want to the node
        text: 'world',
      },
    },

    // edges

    // simple default bezier edge
    // consists of an id, source-id and target-id
    { id: 'e1-3', source: '1', target: '3' },

    // an animated edge, specified by using `animated: true`
    { id: 'e1-2', source: '1', target: '2', animated: true },
    { id: 'e1-4', source: '1', target: '4', animated: true },

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
</script>
<template>
  <div class="vue-flow-container">
    <VueFlow v-model="elements">
      <!-- bind your custom node type to a component by using slots, slot names are always `node-<type>` -->
    <!--      通过slot绑定自定义节点-->
      <template #node-special="props">
        <SpecialNode :data="props.data"/>
      </template>

      <!-- bind your custom edge type to a component by using slots, slot names are always `edge-<type>` -->
      <!--    <template #edge-special="specialEdgeProps">-->
      <!--      <SpecialEdge v-bind="specialEdgeProps" />-->
      <!--    </template>-->
    </VueFlow>
  </div>
</template>

<style>
//  这里要注意导入样式
  /* import the necessary styles for Vue Flow to work */
  @import '@vue-flow/core/dist/style.css';

  /* import the default theme, this is optional but generally recommended */
  @import '@vue-flow/core/dist/theme-default.css';

  .vue-flow-container {
    width: 100vw;
    height: 100vh;
  }
</style>
```
当然，我们最想要的是使用vue组件当作节点，方便我们的控制想要渲染的内容。
我们定义一个vue组件
```vue
<script setup lang='ts'>
const props = defineProps({
  // 定义一个data，用于接收传递的参数
  data: {
    type: Object,
    default: () => {
      return {}
    }
  }
})
</script>

<template>
  <div class="container">
    <span>{{props.data.text}}</span>
  </div>
</template>

<style scoped lang="scss">
.container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 150px;
  height: 150px;
  //border-radius: 50%;
  //border: 2px soild #850F8D;
  background-color: #850F8D;
  span {
    color: #f9f9f9;
    font-size: 30px;
  }
}
</style>
```
