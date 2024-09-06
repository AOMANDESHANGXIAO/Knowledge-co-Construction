import { Position } from "@vue-flow/core"

type GroupNodeProps = {
  groupName: string // 群名
  groupConclusion: string // 群组结论
  bgc: string
  group_id: string | number
  node_id: string // 节点id
  sourcePosition: Position
  targetPosition: Position
}

// interface TimeLineItem {
//   timestamp: string
//   content: string
//   creator: string
// }

export type {
  // TimeLineItem,
  GroupNodeProps
}