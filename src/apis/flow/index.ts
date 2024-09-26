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
  ModifyGroupConclusionParams,
  QueryDashBoardResponse,
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
// /flow/query_content
const queryNodeContentApi = (
  node_id: number,
  student_id: number
): Promise<Response<QueryNodeContentData>> => {
  return Service({
    method: 'get',
    url: '/flow/query_content',
    params: {
      node_id,
      student_id: student_id,
    },
  })
}

const queryGroupNodeContentApi = (
  node_id: number,
  student_id: number
): Promise<Response<QueryNodeContentData>> => {
  return Service({
    method: 'get',
    url: '/flow/query_group_content',
    params: {
      node_id,
      student_id: student_id,
    },
  })
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

const modifyGroupConclusionApi = (
  params: ModifyGroupConclusionParams
): Promise<Response> => {
  return Service.patch('/flow/modify_group_idea', params)
}

/**
 *
 * @param params
 * @returns
 * @deprecated
 */
const reviseGroupConclusionApi = (
  params: ReviseGroupConclusionParams
): Promise<Response> => {
  return Service.post('/flow/revise_group_conclusion', params)
}

const queryDashBoard = async (params: {
  topic_id: number
  student_id: number
  group_id: number
}): Promise<Response<QueryDashBoardResponse>> => {
  return Service.get('/flow/dashboard', { params })
}

type QueryWordCloudResult = {
  list: {
    group_name: string
    text: string
  }[]
}
export type { QueryWordCloudResult }

const queryWordCloudApi = async (params: {
  topic_id: number
}): Promise<Response<QueryWordCloudResult>> => {
  return Service({
    method: 'get',
    url: '/flow/wordCloud',
    params,
  })
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
  proposeGroupConclusionApi,
  modifyGroupConclusionApi,
  queryDashBoard,
  queryGroupNodeContentApi,
  queryWordCloudApi
  // reviseSelfIdeaApi,
}
