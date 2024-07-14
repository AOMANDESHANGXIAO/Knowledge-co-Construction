import Service from '@/apis/index.ts'
import {
  CreateGroupParams,
  JoinGroupParams,
  JoinGroupData,
  QueryCollaborationData,
  QueryMemeberData,
  QueryReviseData,
  QueryGroupMemeberData,
} from './type.ts'
import { Response } from '../libcommon/index.ts'

const createGroupApi = (params: CreateGroupParams): Promise<Response> => {
  return Service.post('/group/create', params)
}

const joinGroupApi = (
  params: JoinGroupParams
): Promise<Response<JoinGroupData>> => {
  return Service.post('/group/join', params)
}

const queryCollaborationData = (
  groud_id: number
): Promise<Response<QueryCollaborationData>> => {
  return Service.get(`/group/query_collaboration_data?group_id=${groud_id}`)
}

const queryMemberData = (
  group_id: number
): Promise<Response<QueryMemeberData>> => {
  return Service.get(`/group/query_member_data?group_id=${group_id}`)
}

const queryReviseData = (
  group_id: number,
  topic_id: number
): Promise<Response<QueryReviseData>> => {
  return Service.get(`/group/query_revise_data`, {
    params: {
      group_id,
      topic_id,
    },
  })
}

const queryGroupStudentsApi = (
  id: string | number
): Promise<Response<QueryGroupMemeberData>> => {
  return Service.get('/group/query_member', {
    params: {
      id,
    },
  })
}

export {
  queryCollaborationData,
  createGroupApi,
  joinGroupApi,
  queryMemberData,
  queryReviseData,
  queryGroupStudentsApi
}
