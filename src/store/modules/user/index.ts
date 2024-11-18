import { defineStore } from 'pinia'
import { ref } from 'vue'
import { User } from './type.ts'
import router from '@/router/index.ts'

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
      group_color: '',
    }
    const userInfo = ref<User>(defaultUserInfo)

    const setUserInfo = (params: User) => {
      userInfo.value = {
        ...userInfo.value,
        ...params,
      }
      // 保存到localStorage
      localStorage.setItem('userInfo', JSON.stringify(userInfo.value))
    }

    function getOneUserInfo<T = User[keyof User]>(key: keyof User): T {
      return userInfo.value[key] as T
    }

    const loadUserInfoFromLocalStorage = () => {
      const storedUserInfo = localStorage.getItem('userInfo')
      if (storedUserInfo) {
        userInfo.value = JSON.parse(storedUserInfo)
      }
    }

    const logout = () => {
      console.log('退出登录了...')
      userInfo.value = defaultUserInfo
      // 退出登录时清除localStorage
      localStorage.removeItem('userInfo')
      router.push('/')
    }

    // 在store初始化时加载用户信息
    loadUserInfoFromLocalStorage()

    return {
      userInfo,
      setUserInfo,
      getOneUserInfo,
      logout,
    }
  },
  {
    persist: true,
  }
)
