import Service from "@/apis/index.ts"

const queryFlowDataApi = (topic_id: number) => {
  return Service.get(`/flow/query?topic_id=${topic_id}`)
}

const queryNodeContentApi = (node_id: number) => {
  return Service.get(`/flow/query_content?node_id=${node_id}`)
}

export { queryFlowDataApi, queryNodeContentApi }
