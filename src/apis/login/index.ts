import Service from '@/apis/index.ts'
import {SignInParams, SignUpParams} from './type.ts'

const queryClassRoomList = () => {
    return Service.get('/classroom/queryClassroomList')
}

const signInAction = (params: SignInParams) => {
    return Service.post('/user/signin', params)
}

const signUpAction = (params: SignUpParams) => {
    return Service.post('/user/signup', params)
}

export {
    signInAction,
    signUpAction,
    queryClassRoomList,
}