import Service from '@/apis/index.ts'
import type {
  ProposeIdeaParams,
  ReplyIdeaParams,
  ReviseGroupConclusionParams,
} from './type.ts'

const queryFlowDataApi = (topic_id: number) => {
  return Service.get(`/flow/query?topic_id=${topic_id}`)
}

const queryNodeContentApi = (node_id: number) => {
  return Service.get(`/flow/query_content?node_id=${node_id}`)
}

const proposeIdeaApi = (params: ProposeIdeaParams) => {
  return Service.post('/flow/propose_idea', params)
}

const replyIdeaApi = (params: ReplyIdeaParams) => {
  return Service.post('/flow/reply_idea', params)
}

const reviseGroupConclusionApi = (params: ReviseGroupConclusionParams) => {
  return Service.post('/flow/revise_group_conclusion', params)
}

export {
  queryFlowDataApi,
  queryNodeContentApi,
  proposeIdeaApi,
  replyIdeaApi,
  reviseGroupConclusionApi,
}
