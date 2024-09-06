import Service from '@/apis/index.ts'
import { Response } from '../libcommon/index.ts'
import type {
  CreateNewIdeaArgs,
  ReplyIdeaParams,
  ReviseGroupConclusionParams,
  ModifyIdeaParams,
  QueryFlowResponse,
  QueryNodeContentData,
  ProposeGroupConclusionParams,
} from './type.ts'

const queryFlowDataApi = (
  topic_id: number
): Promise<Response<QueryFlowResponse>> => {
  return Service.get(`/flow/query`, {
    params: {
      topic_id,
    },
  })
}

const queryNodeContentApi = (
  node_id: number
): Promise<Response<QueryNodeContentData>> => {
  return Service.get(`/flow/query_content?node_id=${node_id}`)
}

const proposeIdeaApi = (params: CreateNewIdeaArgs): Promise<Response> => {
  return Service.post('/flow/propose_idea', params)
}

const replyIdeaApi = (params: ReplyIdeaParams): Promise<Response> => {
  return Service.post('/flow/reply_idea', params)
}

const modifyIdeaApi = (params: ModifyIdeaParams): Promise<Response> => {
  return Service.patch('/flow/modify_idea', params)
}

const proposeGroupConclusionApi = (
  params: ProposeGroupConclusionParams
): Promise<Response> => {
  return Service.post('/flow/propose_group_idea', params)
}

const reviseGroupConclusionApi = (
  params: ReviseGroupConclusionParams
): Promise<Response> => {
  return Service.post('/flow/revise_group_conclusion', params)
}

// const reviseSelfIdeaApi = (params: ReviseSelfIdeaParams): Promise<Response> => {
//   return Service.post('/flow/revise_self_idea', params)
// }

export {
  queryFlowDataApi,
  queryNodeContentApi,
  proposeIdeaApi,
  modifyIdeaApi,
  replyIdeaApi,
  reviseGroupConclusionApi,
  proposeGroupConclusionApi
  // reviseSelfIdeaApi,
}
