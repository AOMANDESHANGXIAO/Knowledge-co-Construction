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
  feedbackList: FeedbackList[];
  proposeList: ProposeList[];
  summaryList: SummaryList[];
  [property: string]: any;
}

interface FeedbackList {
  name?: string;
  value?: number;
  [property: string]: any;
}

interface ProposeList {
  name?: string;
  value?: number;
  [property: string]: any;
}

interface SummaryList {
  name?: string;
  value?: number;
  [property: string]: any;
}


interface QueryReviseData {
  list: QueryReviseListItem[];
  [property: string]: any;
}

interface QueryReviseListItem {
  content: string;
  creator: string;
  timestamp: string;
  [property: string]: any;
}

export type {
  CreateGroupParams,
  JoinGroupParams,
  JoinGroupData,
  QueryCollaborationData,
  QueryMemeberData,
  QueryReviseData
}
