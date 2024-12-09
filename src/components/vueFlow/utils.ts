import {
  Node,
  InteractionNodeData,
  GroupNodeData,
} from '@/apis/viewpoint/interface'

const getStuNodeIds = (nodes: Node[], studentId: string) => {
  return nodes
    .filter(
      node =>
        node.type === 'idea' &&
        (node as InteractionNodeData).data.student_id === studentId
    )
    .map(node => node.id)
}

const getGroupNodeId = (nodes: Node[], group_id: number) => {
  return nodes.find(
    node =>
      node.type === 'group' &&
      String((node as GroupNodeData).data.group_id) === String(group_id)
  )?.id
}

export { getStuNodeIds, getGroupNodeId }
