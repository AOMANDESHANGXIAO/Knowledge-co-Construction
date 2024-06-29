import { defineStore } from 'pinia'
import { ref } from 'vue'
import { User } from './type.ts'

export const useUserStore = defineStore(
  'user',
  () => {
    const userInfo = ref<User>({
      id: 1,
      username: 'Bin',
      nickname: 'Admin Bin',
      token: '',
      class_id: -1,
      group_id: null,
      group_code: 'CKC001',
      group_name: 'CKC专业团队',
      group_color: '#604CC3',
    })

    const setUserInfo = (params: User) => {
      userInfo.value = {
        ...userInfo.value,
        ...params,
      }
    }

    return {
      userInfo,
      setUserInfo,
    }
  },
  { persist: true }
)
