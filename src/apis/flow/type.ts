interface ProposeIdeaParams {
  topic_id: number
  student_id: number
  content: string
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

interface QueryNodeContentData {
  content: string
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
