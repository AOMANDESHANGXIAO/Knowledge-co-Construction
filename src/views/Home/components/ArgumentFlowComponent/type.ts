export enum LayoutDirection {
  Vertical = 'TB', // 上下排列
  Horizontal = 'LR', // 左右排列
}

interface NodeType {
  id: string
  type: string
  data: {
    inputValue: string
    _type: ArgumentType
    [key: string]: any
  }
  _type: ArgumentType
  position: {
    x: number
    y: number
  }
  [propName: string]: any
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

interface FeedBack {
  title: string
  type: 'success' | 'warning' | 'error' | 'info'
  description: string
  [propName: string]: any
}

export enum ArgumentType {
  Backing = 'backing',
  Warrant = 'warrant',
  Claim = 'claim',
  Qualifier = 'qualifier',
  Rebuttal = 'rebuttal',
  Data = 'data',
}

export enum Status {
  Propose,
  Check,
}

export type { NodeType, EdgeType, AddBackPayload, FeedBack, ArgumentNode }
