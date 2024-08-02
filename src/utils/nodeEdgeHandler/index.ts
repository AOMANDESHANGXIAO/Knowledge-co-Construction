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
    edges = edges.filter(edge => {
      return edge._type !== `${sourceType}_${targetType}`
    })
  }
  
  function removeEdgeByTargetType(edges: EdgeType[], targetType: ArgumentType) {
    // 所有的_type都满足一个格式: sourceType_targetType
    // 使用正则表达式移除targetType
  
    const reg = new RegExp(`_${targetType}$`, 'g')
  
    edges = edges.filter(edge => {
      return !reg.test(edge._type)
    })
    console.log('debugger: removeEdgeByTargetType -> edges', edges)
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
  
  return {
    createNode,
    createEdge,
    getDataNodeId,
    getClaimNodeId,
    getNodeById,
    removeNodeById,
    removeEdgeByType,
    removeEdgeByTargetType,
    getNodeIdsByType,
  }
  
}



export {
  useNodeEdgeHandler
}
