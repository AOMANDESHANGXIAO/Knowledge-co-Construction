import type { ListItem } from '@/apis/manageTalk/type.ts'

interface TalkCardItem {
  id: number
  created_time: string
  topic_content: string
  created_user_name: string
}

export type { TalkCardItem, ListItem }
