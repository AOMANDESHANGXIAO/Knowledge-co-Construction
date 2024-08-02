/*
 * @Author       : ridiculous adventurer
 * @Version      : V1.0
 * @Date         : 2024-08-02 10:34:53
 * @Description  :
 */
import {
  ArgumentType,
  NodeType,
} from '@/views/Home/components/ArgumentFlowComponent/type'

function createNode(type: ArgumentType) {
  const id = new Date().getTime().toString()

  const newNode = {
    id,
    type: 'element',
    position: { x: 0, y: 0 },
    _type: type,
    data: {
      nodeId: id,
      inputValue: '',
      _type: type,
    },
  }

  return {
    id: id,
    newNode,
  }
}

function createEdge(params: {
  source: string
  target: string
  sourceType: ArgumentType
  targetType: ArgumentType
}) {
  const { source, target, sourceType, targetType } = params

  const id = new Date().getTime().toString()

  const newEdge = {
    id,
    source: source,
    target: target,
    _type: `${sourceType}_${targetType}`,
  }

  return {
    id: id,
    newEdge,
  }
}

function getDataNodeId(nodes: NodeType[]) {
  for (let i = 0; i < nodes.length; i++) {
    if (nodes[i].data._type === ArgumentType.Data) {
      return nodes[i].id
    }
  }
}

function getClaimNodeId(nodes: NodeType[]) {
  for (let i = 0; i < nodes.length; i++) {
    if (nodes[i].data._type === ArgumentType.Claim) {
      return nodes[i].id
    }
  }
}

export { createNode, createEdge, getDataNodeId, getClaimNodeId }
