import { Node, GroupNode, IdeaNode } from './type'
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

export {
  getStuNodeIds,
  getGroupNodeId
}