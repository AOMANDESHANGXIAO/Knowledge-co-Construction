import { Position as VueFlowPosition } from '@vue-flow/core'
export interface CreateTopicArgs {
  content: string
  creator_id: number
  class_id: number
  status: string
}
export interface CreateIdeaArgs {
  topic_id: number
  student_id: number
  idea_conclusion: string
  idea_reason: string
  idea_limitation: string
}
export interface CreateAgreeArgs {
  topic_id: number
  student_id: number
  target: number
  agree_viewpoint: string
  agree_reason: string
  agree_supplement: string
}
export interface CreateDisAgreeArgs {
  topic_id: number
  student_id: number
  target: number
  disagree_viewpoint: string
  disagree_reason: string
  disagree_suggestion: string
}
export interface CreateAskArgs {
  topic_id: number
  student_id: number
  target: number
  ask_question: string
}
export interface CreateResponseArgs {
  topic_id: number
  student_id: number
  target: number
  response_content: string
}
export interface GetTopicArgs {
  topic_id: number
}
/**
 * 通用参数
 */
export interface GetContentArgs {
  id: number
  student_id: number
}
/**
 * 查询ViewPoint参数
 */
export interface GetViewPointListArgs {
  topic_id: number
  student_id: number
}
// TODO: 补全回复的Response类型
export interface GetViewPointListResponse {
  nodes: Node[]
  edges: Edge[]
  notResponsed: NotResponsed[]
}
export type NodeType =
  | 'group'
  | 'topic'
  | 'idea'
  | 'agree'
  | 'disagree'
  | 'ask'
  | 'response'

export type Node = TopicNodeData | GroupNodeData | InteractionNodeData

export interface Position {
  x: number
  y: number
}

export type TopicNodeData = {
  id: string
  type: 'topic'
  data: {
    id: string
    text: string
    sourcePosition: VueFlowPosition
    targetPosition: VueFlowPosition
  }
  position: Position
}
export type GroupNodeData = {
  id: string
  type: 'group'
  data: {
    id: string
    groupName: string
    groupConclusion: string
    bgc: string
    group_id: string
    node_id: string
    sourcePosition: VueFlowPosition
    targetPosition: VueFlowPosition
  }
  position: Position
}
export type InteractionNodeType =
  | 'idea'
  | 'agree'
  | 'disagree'
  | 'ask'
  | 'response'
export type InteractionNodeData = {
  id: string
  type: InteractionNodeType
  position: Position
  data: {
    type: InteractionNodeType
    name: string
    id: string
    bgc: string
    student_id: string
    sourcePosition: VueFlowPosition
    targetPosition: VueFlowPosition
  }
}
// export type Data = TopicNodeData | GroupNodeData | InteractionNodeData

export interface Edge {
  id: string
  source: string
  target: string
  _type: NodeType
  animated: boolean
}

export interface NotResponsed {
  type: 'agree' | 'disagree' | 'ask' | 'response'
  id: string
  name: string
}
export interface GetTopicResponse {
  content: string
  status: string
}
export interface GetGroupResponse {
  idea_conclusion: string
  idea_reason: string
  idea_limitation: string
  target_viewpoint_id: string
}
export interface GetIdeaResponse {
  idea_conclusion: string
  idea_reason: string
  idea_limitation: string
  target: number
  target_viewpoint_id: string
}
export interface GetAgreeResponse {
  agree_viewpoint: string
  agree_reason: string
  agree_supplement: string
  target_viewpoint_id: string
  target_student_id: string
}
export interface GetDisagreeResponse {
  disagree_viewpoint: string
  disagree_reason: string
  disagree_suggestion: string
  target_viewpoint_id: string
  target_student_id: string
}
export interface GetAskResponse {
  ask_question: string
  target_viewpoint_id: string
  target_student_id: string
}
export interface GetResponseResponse {
  response_content: string
  target_viewpoint_id: string
  target_student_id: string
}
