import Service from '@/apis/index.ts'
import { Response } from '../libcommon'
import { TopicListData } from './type.ts'

const queryTopicListApi = (
  class_id: number,
  content: string = '',
  sort: number = 0
): Promise<Response<TopicListData>> => {
  return Service.get(`/discuss/queryTopic`, {
    params: {
      class_id,
      content,
      sort
    }
  })
}

export { queryTopicListApi }
