import Service from '@/apis/index.ts'
import { CreateGroupParams, JoinGroupParams } from './type.ts'

const createGroupApi = (params: CreateGroupParams) => {
  return Service.post('/group/create', params)
}

const joinGroupApi = (params: JoinGroupParams) => {
  return Service.post('/group/join', params)
}

const queryCollaborationData = (groud_id: number) => {
  return Service.get(`/group/query_collaboration_data?group_id=${groud_id}`)
}

const queryMemberData = (group_id: number) => {
  return Service.get(`/group/query_member_data?group_id=${group_id}`)
}

const queryReviseData = (group_id: number, topic_id: number) => {
  return Service.get(`/group/query_revise_data`, {
    params: {
      group_id,
      topic_id,
    },
  })
}

export {
  queryCollaborationData,
  createGroupApi,
  joinGroupApi,
  queryMemberData,
  queryReviseData,
}
