import { EDGE_COLORS } from './option'
import { shallowRef } from 'vue'
import { queryFlowDataApi } from '@/apis/flow'
import { Node, Edge, LayoutDir, GroupNode, IdeaNode } from './type'
import { Position } from '@vue-flow/core'
import { useLayout } from '@/hooks/VueFlow/useLayout'
import _ from 'lodash'
import { ElNotification } from 'element-plus'
import { nextTick } from 'vue'
import { useVueFlow } from '@vue-flow/core'
import { usePrevious } from 'vue-hooks-plus'
import useRequest from '@/hooks/Async/useRequest'
import { QueryFlowResponse } from '@/apis/flow/type'

const { fitView } = useVueFlow()

const getStuNodeIds = (nodes: Node[], studentId: string) => {
  return nodes
    .filter(
      node =>
        node.type === 'idea' && (node.data as IdeaNode).student_id === studentId
    )
    .map(node => node.id)
}

const getGroupNodeId = (nodes: Node[], group_id: number) => {
  return nodes.find(
    node =>
      node.type === 'group' && (node.data as GroupNode).group_id === group_id
  )?.id
}

export function useNotification() {
  // 获取新增节点的ids
  function getNewEdges(oldEdges: Edge[], newEdges: Edge[]) {
    return _.differenceBy(newEdges, oldEdges, 'id')
  }

  /**
   *
   * @param newEdges
   * @param userId
   * @param nodes
   * @description 设置通知给学生，如果有edges中有指向自己的节点，则设置通知
   */
  function setHighlightNotification(
    newEdges: Edge[],
    studentId: string,
    nodes: Node[]
  ) {
    // 1. 从nodes中获得自己的节点
    const stuNodeIds = getStuNodeIds(nodes, studentId)
    // 2. 遍历newEdges,若是target指向学生自己的节点，则是被回复了
    const pointerStuEdges = newEdges.filter(edge =>
      stuNodeIds.includes(edge.target)
    )

    ElNotification({
      title: '互动通知',
      message: `您有${pointerStuEdges.length}条回复`,
      type: 'success',
      duration: 5000,
    })

    // 3. 设置节点highlight
    return nodes.map(node => {
      if (stuNodeIds.includes(node.id)) {
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
  }

  return {
    getNewEdges,
    setHighlightNotification,
  }
}

/**
 * The hook of the vue flow component
 */
export default function useMyVueFlow({
  student_id,
  topic_id,
  group_id,
}: {
  student_id: string
  topic_id: number
  group_id: number
}) {
  const nodes = shallowRef<Node[]>([])
  const edges = shallowRef<Edge[]>([])

  const prevNodes = usePrevious(nodes)
  const prevEdges = usePrevious(edges)

  const { layout } = useLayout()

  const { setHighlightNotification } = useNotification()

  const { data, run } = useRequest({
    apiFn: async () => {
      return await queryFlowDataApi(topic_id)
    },
    onSuccess: () => {},
    onFail: () => {},
    formatter: (data: QueryFlowResponse) => {
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
                student_id: String(data.id),
                highlight: false,
                targetPosition: Position.Left,
                sourcePosition: Position.Right,
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
                targetPosition: Position.Left,
                sourcePosition: Position.Right,
              },
            }
          } else {
            return {
              ...node,
              data: {
                text: node.data.text,
                sourcePosition: Position.Left,
                targetPosition: Position.Right,
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
        })
      }
    },
  })

  // /**
  //  *
  //  * @description 获取边和节点数据
  //  */
  // async function fetchGraphData(): Promise<{ nodes: Node[]; edges: Edge[] }> {
  //   const res = await queryFlowDataApi(topic_id)
  //   if (res.success) {
  //     return {
  //       nodes: res.data.nodes.map(node => {
  //         if (node.type === 'idea') {
  //           const { data } = node
  //           return {
  //             ...node,
  //             data: {
  //               name: data.name,
  //               id: String(data.id),
  //               bgc: data.bgc,
  //               student_id: String(data.id),
  //               highlight: false,
  //               targetPosition: Position.Left,
  //               sourcePosition: Position.Right,
  //             },
  //           }
  //         } else if (node.type === 'group') {
  //           return {
  //             ...node,
  //             data: {
  //               groupName: node.data.groupName,
  //               groupConclusion: node.data.groupConclusion,
  //               bgc: node.data.bgc,
  //               group_id: node.data.group_id,
  //               targetPosition: Position.Left,
  //               sourcePosition: Position.Right,
  //             },
  //           }
  //         } else {
  //           return {
  //             ...node,
  //             data: {
  //               text: node.data.text,
  //               sourcePosition: Position.Left,
  //               targetPosition: Position.Right,
  //             },
  //           }
  //         }
  //       }),
  //       edges: res.data.edges.map(edge => {
  //         const strokeColor = EDGE_COLORS[edge._type]
  //         return {
  //           ...edge,
  //           style: {
  //             stroke: strokeColor,
  //           },
  //         }
  //       }),
  //     }
  //   }
  //   return { nodes: [], edges: [] }
  // }

  async function drawGraph() {
    // const { nodes: newNodes, edges: newEdges } = await fetchGraphData()
    await run()
    nodes.value = data.value.nodes
    edges.value = data.value.edges
    handleLayoutGraph('LR')
  }

  function setNodesPosition(direction: LayoutDir) {
    const sourcePosition = direction === 'LR' ? Position.Right : Position.Bottom
    const targetPosition = direction === 'LR' ? Position.Left : Position.Top
    nodes.value.forEach(node => {
      node.data.sourcePosition = sourcePosition
      node.data.targetPosition = targetPosition
    })
  }

  async function handleLayoutGraph(direction: LayoutDir) {
    setNodesPosition(direction)
    nodes.value = layout(nodes.value, edges.value, direction)
    // 查询是否有回复自己的
    const stuNodeIds = getStuNodeIds(nodes.value, student_id)

    const positionNodes: { nodes: string[] } = { nodes: [] }

    if (stuNodeIds.length) {
      nodes.value = setHighlightNotification(
        edges.value,
        student_id,
        nodes.value
      )
      positionNodes.nodes = stuNodeIds
    } else {
      // 查找团队节点
      const groupNodeId = getGroupNodeId(nodes.value, group_id)

      if (groupNodeId) {
        positionNodes.nodes = [groupNodeId]
      }
    }

    await nextTick(() => {
      if (positionNodes.nodes.length) {
        fitView(positionNodes)
      } else {
        fitView()
      }
    })
  }

  return {
    nodes,
    edges,
    // fetchGraphData,
    setNodesPosition,
    handleLayoutGraph,
  }
}
