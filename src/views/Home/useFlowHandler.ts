import { Node, Edge } from '@/components/vueFlow/type'
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
}

export default flowTool
