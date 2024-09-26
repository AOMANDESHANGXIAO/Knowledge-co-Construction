import { useNodeEdgeHandler } from '@/utils/nodeEdgeHandler/index.ts'
import { NodeType, EdgeType } from '../type.ts'
import { ArgumentType } from '../type'

/**
 * 处理论证图中的节点和边的工具函数
 */
const {
  createNode,
  createEdge,
  getRebuttalNodeId,
  getClaimNodeId,
  getNodeById,
  removeNodeById,
  removeEdgeByRelatedId,
  removeEdgeByTargetType,
  getNodeIdsByType,
  clearNotRealatedEdges,
  getQualifierNodeId,
} = useNodeEdgeHandler()

/**
 * 用来处理argument Node和edge的状态编辑Hook
 */
export default function useStateEdit({
  nodes,
  edges,
  setNodes,
  setEdges,
  initState,
  onAddNodeTrigger,
  onRemoveNodeTrigger,
  onQualifierReadyTrigger,
  onNotQualifierReadyTrigger,
  onRebuttalReadyTrigger,
  onResetTrigger,
  onRemoveQualifierWithRebuttalTrigger,
  onRemoveWarrantWithBackingTrigger,
}: {
  nodes: Ref<NodeType[]>
  edges: Ref<EdgeType[]>
  setNodes: (nodes: NodeType[]) => void
  setEdges: (edges: EdgeType[]) => void
  initState?: { nodes: NodeType[]; edges: EdgeType[] }
  onAddNodeTrigger?: () => void // 添加节点时触发
  onRemoveNodeTrigger?: () => void // 移除节点时触发
  onQualifierReadyTrigger?: () => void // 如果已经有限定词时触发
  onNotQualifierReadyTrigger?: () => void // 如果没有限定词时触发
  onRebuttalReadyTrigger?: () => void // 如果已经有反驳时触发
  onResetTrigger?: () => void // 重置时触发
  onRemoveQualifierWithRebuttalTrigger?: () => void // 试图删除一个具有反驳的节点时触发
  onRemoveWarrantWithBackingTrigger?: () => void // 试图删除一个具有支撑的辩护时触发
}) {
  const DEFAULT_CLAIM_ID = 'claim'
  const DEFAULT_DATA_ID = 'data' // 默认的前提和结论Nodeid

  /**
   *
   * @param argumentType 添加的节点类型
   * @returns
   * @description 添加节点
   */
  function addNode(
    argumentType: ArgumentType.Backing,
    payload: {
      nodeId: string
      inputValue: string
    }
  ): void
  function addNode(argumentType: ArgumentType.Warrant): void
  function addNode(argumentType: ArgumentType.Qualifier): void
  function addNode(argumentType: ArgumentType.Rebuttal): void
  function addNode(
    argumentType: ArgumentType,
    payload?: {
      nodeId: string
      inputValue: string
    }
  ) {
    let nodesValue = [...nodes.value]
    let edgesValue = [...edges.value]

    switch (argumentType) {
      case ArgumentType.Backing: {
        /**
         * 添加支撑
         */
        console.log('paload', payload)
        const nodeId = payload?.nodeId
        if (!nodeId) {
          return
        }
        const { id, newNode } = createNode(ArgumentType.Backing)
        const edgeOption = {
          source: id,
          target: nodeId,
          sourceType: ArgumentType.Backing,
          targetType: ArgumentType.Warrant,
        }
        const { newEdge } = createEdge(edgeOption)

        setNodes([...nodesValue, newNode])
        setEdges([...edgesValue, newEdge])

        break
      }
      case ArgumentType.Warrant: {
        /**
         * 添加辩护
         */
        const { id, newNode } = createNode(ArgumentType.Warrant)

        // 如果有限定词那么将辩护连接到限定词,限定词有且只有一个
        const qualifierNodeId = getQualifierNodeId(nodesValue)
        // 如果没有限定词那么直接连接到结论,结论有且只有一个
        const claimNodeId = getClaimNodeId(nodesValue)

        const target = qualifierNodeId || claimNodeId || DEFAULT_CLAIM_ID

        const targetType = qualifierNodeId
          ? ArgumentType.Qualifier
          : ArgumentType.Claim

        const edgeOption = {
          source: id,
          target: target,
          sourceType: ArgumentType.Warrant,
          targetType: targetType,
        }

        const { newEdge } = createEdge(edgeOption)

        setNodes([...nodesValue, newNode])
        setEdges([...edgesValue, newEdge])
        break
      }
      case ArgumentType.Claim:
      case ArgumentType.Qualifier: {
        /**
         * 添加限定词
         */
        // 1. 判断有没有限定词
        const qualifierNodeId = getQualifierNodeId(nodesValue)
        console.log('qualifierNodeId', qualifierNodeId)
        if (qualifierNodeId) {
          onQualifierReadyTrigger && onQualifierReadyTrigger()
          return
        }

        // 限定词要指向claim
        const { id: newQualifierNodeId, newNode } = createNode(
          ArgumentType.Qualifier
        )
        console.log('newQualifierNodeId', newQualifierNodeId)

        const claimNodeId = getClaimNodeId(nodesValue)
        if (!claimNodeId) {
          return
        }
        const edgeOption = {
          source: newQualifierNodeId,
          target: claimNodeId,
          sourceType: ArgumentType.Qualifier,
          targetType: ArgumentType.Claim,
        }

        const { newEdge } = createEdge(edgeOption)

        // 原先的data,warrant都指向了结论，添加限定词后要将它们指向限定词
        const dataToClaim = `${ArgumentType.Data}_${ArgumentType.Claim}`
        const warrantToClaim = `${ArgumentType.Warrant}_${ArgumentType.Claim}`

        const newEdgesValue = edgesValue.map(edge => {
          if (edge._type === dataToClaim || edge._type === warrantToClaim) {
            return {
              ...edge,
              _type: edge._type === dataToClaim ? dataToClaim : warrantToClaim,
              target: newQualifierNodeId,
            }
          }
          return edge
        })

        setNodes([...nodesValue, newNode])
        setEdges([...newEdgesValue, newEdge])

        break
      }
      case ArgumentType.Rebuttal: {
        const qualifierNodeId = getQualifierNodeId(nodesValue)
        if (!qualifierNodeId) {
          onNotQualifierReadyTrigger && onNotQualifierReadyTrigger()
          return
        }

        const rebuttalNodeId = getRebuttalNodeId(nodesValue)
        if (rebuttalNodeId) {
          onRebuttalReadyTrigger && onRebuttalReadyTrigger()
          return
        }

        const { id: rebuttalId, newNode } = createNode(ArgumentType.Rebuttal)
        edgesValue = edgesValue.filter(edge => {
          return (
            edge._type !== `${ArgumentType.Qualifier}_${ArgumentType.Claim}`
          )
        })
        // 限定指向反驳
        const edgeOfQualifierToRebuttal = createEdge({
          source: qualifierNodeId,
          target: rebuttalId,
          sourceType: ArgumentType.Qualifier,
          targetType: ArgumentType.Rebuttal,
        })
        edgesValue.push(edgeOfQualifierToRebuttal.newEdge)
        const claimNodeId = getClaimNodeId(nodesValue) as string

        // 反驳指向claim
        const edgeOption = {
          source: rebuttalId,
          target: claimNodeId,
          sourceType: ArgumentType.Rebuttal,
          targetType: ArgumentType.Claim,
        }

        const { newEdge } = createEdge(edgeOption)

        setNodes([...nodesValue, newNode])
        setEdges([...edgesValue, newEdge])

        break
      }
      case ArgumentType.Data:
    }
    onAddNodeTrigger && onAddNodeTrigger()
    setEdges(clearNotRealatedEdges(nodes.value, edges.value))
  }

  /**
   *
   * @param id: string 被移除的论证节点ID
   * @returns
   * @description 移除节点
   */
  function removeNode(id: string) {
    const nodesValue = nodes.value
    const edgesValue = edges.value

    const node = getNodeById(nodesValue, id)
    if (!node) return false

    const argumentType = node._type

    switch (argumentType) {
      case ArgumentType.Claim:
      case ArgumentType.Data: {
        console.log('can not remove data and claim node')
        return
      }
      case ArgumentType.Rebuttal: {
        /**
         * 删除反驳节点
         */
        // 1. 删除反驳节点
        const removedNodes = removeNodeById(nodesValue, id)
        // 2. 移除所有和反驳相关的edge
        const removedEdges = removeEdgeByRelatedId(edgesValue, id)

        // 3. 将限定词指向结论
        const quelifierNodeId = getQualifierNodeId(nodesValue) as string
        const claimNodeId = getClaimNodeId(nodesValue) as string

        const edgeOption = {
          source: quelifierNodeId,
          target: claimNodeId,
          sourceType: ArgumentType.Qualifier,
          targetType: ArgumentType.Claim,
        }

        const { newEdge } = createEdge(edgeOption)
        setNodes(removedNodes)
        setEdges([...removedEdges, newEdge])
        break
      }
      case ArgumentType.Backing: {
        /**
         * 移除辩护的支撑点
         */
        const removedNodes = removeNodeById(nodesValue, id)
        setNodes(removedNodes)
        break
      }
      case ArgumentType.Warrant: {
        /**
         * 移除辩护
         */
        // 如果这个辩护有支撑，则不允许删除
        const isBacked = edgesValue.find(edge => {
          return (
            edge._type === `${ArgumentType.Backing}_${ArgumentType.Warrant}` &&
            edge.target === id
          )
        })

        if (isBacked) {
          onRemoveWarrantWithBackingTrigger &&
            onRemoveWarrantWithBackingTrigger()
          console.log('can not delete a warrant with backed')
          return
        }
        const removeNodes = removeNodeById(nodesValue, id)
        setNodes(removeNodes)

        break
      }
      case ArgumentType.Qualifier: {
        // 不允许删除具有反驳的限定词节点
        const rebuttalNodeId = getRebuttalNodeId(nodesValue)
        if (rebuttalNodeId) {
          console.log('can not delete a qualifier with a rebuttal node')
          onRemoveQualifierWithRebuttalTrigger &&
            onRemoveQualifierWithRebuttalTrigger()
          return
        }
        /**
         * 删除限定词节点
         */
        const removedNodes = removeNodeById(nodesValue, id)
        // 移除任何指向限定词的edge
        const removedEdges = removeEdgeByTargetType(edgesValue, argumentType)
        // 更改指向将类型为Data、Warrant的节点指向结论
        const selectedNodes = getNodeIdsByType(removedNodes, [
          ArgumentType.Data,
          ArgumentType.Warrant,
        ])
        // 构造新的边
        const claimNodeId = getClaimNodeId(nodesValue) as string
        const newEdges = selectedNodes
          .map(node => {
            if (!node) return undefined
            const edgeOption = {
              source: node.id,
              target: claimNodeId,
              sourceType: node._type,
              targetType: ArgumentType.Claim,
            }
            const { newEdge } = createEdge(edgeOption)
            removedEdges.push(newEdge)
          })
          .filter(edge => edge !== undefined)
        console.log('new Nodes', removedNodes)
        console.log('new Edges', [...removedEdges, ...newEdges])
        setNodes([...removedNodes])
        setEdges([...removedEdges, ...newEdges])
      }
    }

    // 移除所有不相关的边
    setEdges(clearNotRealatedEdges(nodes.value, edges.value))

    if (onRemoveNodeTrigger) {
      onRemoveNodeTrigger()
    }
  }

  /**
   * 重置状态
   */
  function resetState() {
    setNodes(initState?.nodes || [])
    setEdges(initState?.edges || [])
    onResetTrigger && onResetTrigger()
  }

  return {
    addNode,
    removeNode,
    resetState,
    DEFAULT_CLAIM_ID,
    DEFAULT_DATA_ID,
  }
}
