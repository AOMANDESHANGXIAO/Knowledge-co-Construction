import Service from '@/apis/index.ts'
import {
  SignInParams,
  SignUpParams,
  ClassRoomList,
  SignInData,
  SignUpData,
  QueryUserCollInfoData,
} from './type.ts'
import { Response } from '../libcommon/index.ts'

const queryClassRoomList = (): Promise<Response<ClassRoomList>> => {
  return Service.get('/classroom/queryClassroomList')
}

const signInAction = (params: SignInParams): Promise<Response<SignInData>> => {
  return Service.post('/user/signin', params)
}

const signUpAction = (params: SignUpParams): Promise<Response<SignUpData>> => {
  return Service.post('/user/signup', params)
}

const queryUserCollInfo = (
  id: number,
  group_id: number
): Promise<Response<QueryUserCollInfoData>> => {
  return Service.get('/user/collInfo', {
    params: {
      id,
      group_id
    },
  })
}

export { signInAction, signUpAction, queryClassRoomList, queryUserCollInfo }
