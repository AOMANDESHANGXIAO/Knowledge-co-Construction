import Service from '@/apis/index.ts'
import { Response } from '../libcommon'
import { TopicListData } from './type.ts'

const queryTopicListApi = (
  class_id: number
): Promise<Response<TopicListData>> => {
  return Service.get(`/discuss/queryTopic?class_id=${class_id}`)
}

export { queryTopicListApi }
