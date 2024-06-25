import Service from "@/apis/index.ts"

const queryFlowDataApi = (topic_id: number) => {
  return Service.get(`/flow/query?topic_id=${topic_id}`)
}

export { queryFlowDataApi }
