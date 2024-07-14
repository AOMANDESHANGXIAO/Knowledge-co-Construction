import { QueryUserCollInfoData } from '@/apis/user/type'
interface CreateGroupParams {
  student_id?: number
  group_name: string
  group_description: string
  group_color: string
  class_id: number
}

interface JoinGroupParams {
  group_code: string
  student_id: number
}

interface JoinGroupData {
  belong_class_id: number
  group_code: string
  group_color: string
  group_description: string
  group_id: number
  group_name: string
  [property: string]: any
}

interface QueryCollaborationData {
  list: CollaborationListItem[]
  [property: string]: any
}

interface CollaborationListItem {
  iconName: string
  num: number
  text: string
  [property: string]: any
}

interface QueryMemeberData {
  feedbackList: FeedbackList[]
  proposeList: ProposeList[]
  summaryList: SummaryList[]
  [property: string]: any
}

interface FeedbackList {
  name?: string
  value?: number
  [property: string]: any
}

interface ProposeList {
  name?: string
  value?: number
  [property: string]: any
}

interface SummaryList {
  name?: string
  value?: number
  [property: string]: any
}

interface QueryReviseData {
  list: QueryReviseListItem[]
  [property: string]: any
}

interface QueryReviseListItem {
  content: string
  creator: string
  timestamp: string
  [property: string]: any
}

interface QueryGroupMemberItem {
  id: number | string // 成员id
  name: string // 成员昵称
  data?: QueryUserCollInfoData // 成员数据
  title?: string
}

interface QueryGroupMemeberData {
  list: QueryGroupMemberItem[]
  [property: string]: any
}

export type {
  CreateGroupParams,
  JoinGroupParams,
  JoinGroupData,
  QueryCollaborationData,
  CollaborationListItem,
  QueryMemeberData,
  QueryReviseData,
  QueryGroupMemberItem,
  QueryGroupMemeberData,
}
