import Service from '@/apis/index.ts'
import { CreateGroupParams, JoinGroupParams } from './type.ts'

const createGroupApi = (params: CreateGroupParams) => {
    return Service.post('/group/create', params)
}

const joinGroupApi = (params: JoinGroupParams) => {
    return Service.post('/group/join', params)
}

export {
    createGroupApi,
    joinGroupApi
}