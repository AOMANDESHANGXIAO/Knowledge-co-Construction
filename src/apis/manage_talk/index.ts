import Service from "@/apis/index.ts"

const queryTopicListApi = (class_id: number) => {
  return Service.get(`/discuss/queryTopic?class_id=${class_id}`)
}

export {
  queryTopicListApi
}