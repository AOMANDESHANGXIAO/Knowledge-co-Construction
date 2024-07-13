import Service from '@/apis/index.ts'
import {
  SignInParams,
  SignUpParams,
  ClassRoomList,
  SignInData,
  SignUpData,
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

export { signInAction, signUpAction, queryClassRoomList }
