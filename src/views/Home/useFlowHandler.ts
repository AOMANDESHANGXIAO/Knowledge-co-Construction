import { Node, Edge, IdeaNode } from '@/components/vueFlow/type'
// import { getStuNodeIds } from '@/components/vueFlow/utils'
import _ from 'lodash'

class flowTool {
  static findTargetNodeBySourceId({
    nodes,
    edges,
    node_id,
  }: {
    nodes: Node[]
    edges: Edge[]
    node_id: string
  }) {
    const target = edges.find(edge => edge.source === node_id)
    return nodes.find(node => node.id === target?.target)
  }

  /**
   * 拿到回复我的所有节点
   */
  static getResponseNodes({
    nodes,
    edges,
    student_id,
  }: {
    nodes: Node[]
    edges: Edge[]
    student_id: string
  }) {
    // 找到所有与student_id相关的node节点
    const relatedNodes = nodes.filter(node => {
      const data = node.data as IdeaNode
      return (
        ['idea', 'question'].includes(node.type) &&
        String(data.student_id) === String(student_id)
      )
    })
    console.log('getResponseNodes => relatedNodes', relatedNodes)
    // 找到所有指向relatedNodes的edge节点
    const allResponseEdges = edges.filter(edge => {
      return relatedNodes.find(node => String(node.id) === String(edge.target))
    })
    return {
      approve: allResponseEdges.filter(edge => edge._type === 'approve'),
      reject: allResponseEdges.filter(edge => edge._type === 'reject'),
      question: allResponseEdges.filter(
        edge => edge._type === 'question_to_idea'
      ),
    }
  }
}

export default flowTool
