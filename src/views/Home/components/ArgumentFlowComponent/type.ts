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

// TODO: 优化代码
// 将状态改为由两个状态控制
export enum Role {
  Idea = 'idea',
  Conclusion = 'Conclusion',
}

export enum Action {
  Check = 'check',
  Modify = 'modify',
}

export enum Status {
  Propose, // 提出
  Check, // 查看
  Modify, // 修改
  CheckGroup, // 查看群组
  FirstSummary, // 小组首次总结观点
  ModifyGroupConclusion, // 修改群组总结
}

export type Condition =
  | 'checkIdea'
  | 'checkConclusion'
  | 'modifyIdea'
  | 'modifyConclusion'
  | 'replyIdea'
  | 'proposeIdea'
  | 'proposeConclusion'
  | 'responseQuestion'

export type { NodeType, EdgeType, AddBackPayload, FeedBack, ArgumentNode }
