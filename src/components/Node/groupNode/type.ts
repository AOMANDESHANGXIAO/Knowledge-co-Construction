type GroupNodeProps = {
  groupName: string // 群名
  groupConclusion: string // 群组结论
  bgc: string
}

interface TimeLineItem {
  timestamp: string
  content: string
  creator: string
}

export type {
  TimeLineItem,
  GroupNodeProps
}