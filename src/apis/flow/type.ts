import { ArgumentType } from '@/views/Home/components/ArgumentFlowComponent/type'
// import { Position } from '@vue-flow/core'

interface CreateNewIdeaArgs {
  topic_id: number
  student_id: number
  nodes: Array<{
    id: string
    data: {
      inputValue: string
      _type: string
    }
    type: 'element'
  }>
  edges: Array<{
    id: string
    source: string
    target: string
    _type: string
  }>
}
/**
 * @deprecated
 */
interface ProposeIdeaParams {
  topic_id: number
  student_id: number
  nodes: ArgumentNode[]
  edges: ArgumentEdge[]
  [property: string]: any
}

interface ReplyIdeaParams {
  topic_id: number
  student_id: number
  content: string
  reply_to: number
  reply_type: 1 | 0 // 1 表示统一， 0表示反对
}

interface ReviseGroupConclusionParams {
  topic_id: number
  student_id: number
  group_id: number
  conclusion: string
}

interface ReviseSelfIdeaParams {
  node_id: number
  content: string
  student_id: number
}

/**
 * @deprecated
 */
interface QueryFlowData {
  edges: Edge[]
  nodes: Node[]
  [property: string]: any
}

interface Edge {
  id: string
  source: string
  target: string
  type: string
  [property: string]: any
}

interface Node {
  data: NodeData
  id: string
  type: string
  position: {
    x: number
    y: number
  }
  [property: string]: any
}

interface NodeData {
  groupConclusion?: string
  groupName?: string
  id: number
  name: string
  text?: string
  [property: string]: any
}

interface ArgumentNode {
  id: string
  data: {
    inputValue: string
    _type: ArgumentType
  }
  _type: ArgumentType
  position: {
    x: number
    y: number
  }
  type: 'element'
  [property: string]: any
}

interface ArgumentEdge {
  id: string
  source: string
  target: string
  _type: string
}

interface QueryNodeContentData {
  nodes: Pick<ArgumentNode, 'id' | 'data' | 'type' | 'position'>[]
  edges: ArgumentEdge[]
  [property: string]: any
}

interface NodeResponseBased<T extends 'idea' | 'group' | 'topic', D> {
  id: string
  type: T
  position: {
    x: number
    y: number
  }
  data: D
}
interface EdgeResponse {
  id: string
  source: string
  target: string
  _type: "idea_to_group" | "group_to_discuss" | "approve" | "reject"
  animated: boolean
}

interface QueryFlowResponse {
  nodes: Array<
    | NodeResponseBased<
        'idea',
        {
          name: string
          id: number
          bgc: string
          student_id: number
        }
      >
    | NodeResponseBased<
        'group',
        {
          groupName: string
          groupConclusion: string
          bgc: string
          group_id: number
        }
      >
    | NodeResponseBased<'topic', { text: string }>
  >
  edges: Array<EdgeResponse>
}

export type {
  ProposeIdeaParams,
  ReplyIdeaParams,
  ReviseGroupConclusionParams,
  ReviseSelfIdeaParams,
  QueryFlowData,
  QueryNodeContentData,
  CreateNewIdeaArgs,
  QueryFlowResponse
}
