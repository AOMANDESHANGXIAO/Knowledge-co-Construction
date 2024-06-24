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

export type { CreateGroupParams, JoinGroupParams }
