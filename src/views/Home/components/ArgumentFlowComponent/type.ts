export enum LayoutDirection {
  Vertical = 'TB', // 上下排列
  Horizontal = 'LR', // 左右排列
}

interface NodeType {
  id: string
  type: string
  data?: any
  position: {
    x: number
    y: number
  }
  [propName: string]: any
}

interface EdgeType {
  id: string
  source: string
  target: string
  _type: string
  [propName: string]: any
}

interface AddBackPayload {
  nodeId: string
  inputValue: string
}

export type {
  NodeType,
  EdgeType,
  AddBackPayload,
}