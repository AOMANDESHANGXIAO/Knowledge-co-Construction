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
export type { ProposeIdeaParams, ReplyIdeaParams, ReviseGroupConclusionParams }
