/*
 * @Author       : ridiculous adventurer
 * @Version      : V1.0
 * @Date         : 2024-08-02 10:34:53
 * @Description  :
 */
import {
  ArgumentType,
  EdgeType,
  NodeType,
} from '@/views/Home/components/ArgumentFlowComponent/type'

interface FilterFunction {
  (edge: EdgeType): boolean
}

function useNodeEdgeHandler() {
  let cnt = 0

  function createId() {
    return new Date().getTime().toString() + `_${cnt++}`
  }

  function createNode(type: ArgumentType) {
    const id = createId()

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

    const id = createId()

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

  function getNodeById(nodes: NodeType[], id: string) {
    for (let i = 0; i < nodes.length; i++) {
      if (nodes[i].id === id) {
        return nodes[i]
      }
    }
  }

  function getNodeIdsByType(nodes: NodeType[], types: ArgumentType[]) {
    return nodes.map(node => {
      for (let i = 0; i < types.length; i++) {
        if (node._type === types[i]) {
          return {
            id: node.id,
            _type: node._type,
          }
        }
      }
    })
  }

  function removeNodeById(nodes: NodeType[], id: string) {
    for (let i = 0; i < nodes.length; i++) {
      if (nodes[i].id === id) {
        nodes.splice(i, 1)
        return
      }
    }
  }

  function removeEdgeByType(
    edges: EdgeType[],
    sourceType: ArgumentType,
    targetType: ArgumentType
  ) {
    return edges.filter(edge => {
      return edge._type !== `${sourceType}_${targetType}`
    })
  }

  function removeEdgeByTargetType(edges: EdgeType[], targetType: ArgumentType) {
    // 所有的_type都满足一个格式: sourceType_targetType
    // 使用正则表达式移除targetType

    const reg = new RegExp(`_${targetType}$`, 'g')

    return edges.filter(edge => {
      return !reg.test(edge._type)
    })
  }

  function removeEdgeBySourceType(edges: EdgeType[], sourceType: ArgumentType) {
    // 所有的_type都满足一个格式: sourceType_targetType
    // 使用正则表达式移除sourceType

    const reg = new RegExp(`^${sourceType}_`, 'g')

    return edges.filter(edge => {
      return !reg.test(edge._type)
    })
  }

  function removeEdgeByRelatedId(edges: EdgeType[], relatedId: string) {
    return edges.filter(edge => {
      return edge.source !== relatedId && edge.target !== relatedId
    })
  }

  /**
   * 
   * @param nodes 
   * @param edges 
   * @description 移除所有没有source和target中指向的node不存在的edge 
   */
  function clearNotRealatedEdges(nodes: NodeType[], edges: EdgeType[]) {

    const nodeIdsMap = new Map<string, boolean>()

    nodes.forEach(node => {
      nodeIdsMap.set(node.id, true)
    })

    return edges.filter(edge => {
      return nodeIdsMap.get(edge.source) && nodeIdsMap.get(edge.target)
    })
  }



  function findIsEdgesExistBySourceId(
    edges: EdgeType[],
    sourceId: string,
    cb?: FilterFunction
  ) {
    for (let i = 0; i < edges.length; i++) {
      if (edges[i].source === sourceId) {
        console.log('debugger edges[i].source', edges[i].source, sourceId)
        if (!cb) {
          return true
        }
        return cb(edges[i])
      }
    }
    return false
  }

  return {
    createNode,
    createEdge,
    getDataNodeId,
    getClaimNodeId,
    getNodeById,
    getNodeIdsByType,
    removeNodeById,
    removeEdgeByType,
    removeEdgeByTargetType,
    removeEdgeBySourceType,
    removeEdgeByRelatedId,
    findIsEdgesExistBySourceId,
    clearNotRealatedEdges
  }
}

export { useNodeEdgeHandler }
