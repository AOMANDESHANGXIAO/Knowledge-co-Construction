import { ArgumentType } from "@/views/Home/components/ArgumentFlowComponent/type"

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

interface QueryFlowData {
  edges: Edge[];
  nodes: Node[];
  [property: string]: any;
}

interface Edge {
  id: number;
  source: number;
  target: number;
  type: string;
  [property: string]: any;
}

interface Node {
  data: NodeData;
  id: number;
  type: string;
  [property: string]: any;
}

interface NodeData {
  groupConclusion?: string;
  groupName?: string;
  id: number;
  name: string;
  text?: string;
  [property: string]: any;
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
  nodes: ArgumentNode[]
  edges: ArgumentEdge[]
  [property: string]: any
}

export type {
  ProposeIdeaParams,
  ReplyIdeaParams,
  ReviseGroupConclusionParams,
  ReviseSelfIdeaParams,
  QueryFlowData,
  QueryNodeContentData
}
