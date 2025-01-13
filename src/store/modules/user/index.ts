import { defineStore } from 'pinia'
import { User } from './type.ts'
import { routerBus } from '@/router/index.ts'
import { useLocalStorage } from '@vueuse/core'

export const useUserStore = defineStore(
  'user',
  () => {
    const defaultUserInfo = {
      id: -1,
      username: '',
      nickname: '',
      token: '',
      class_id: -1,
      group_id: null,
      group_code: '',
      group_name: '',
      group_color: ''
    }
    const userInfo = useLocalStorage<User>('userInfo', defaultUserInfo)

    const getToken = () => userInfo.value.token

    const setUserInfo = (params: User) => {
      userInfo.value = {
        ...userInfo.value,
        ...params
      }
    }

    function getOneUserInfo<T = User[keyof User]>(key: keyof User): T {
      return userInfo.value[key] as T
    }

    const logout = () => {
      userInfo.value = defaultUserInfo
      routerBus.emit('logout')
    }

    return {
      userInfo,
      setUserInfo,
      getToken,
      getOneUserInfo,
      logout
    }
  },
  {
    persist: true
  }
)
