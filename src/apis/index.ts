// src/http/axios.js
import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from '@/router'
import { escapeData } from '@/utils/escapeHandler'

axios.defaults.timeout = 10000 // 请求超时时间
export type Response<T = any> = Promise<{
  data: T
  message: string
  success: boolean
  code: number
}>
// 开发环境
export const BASE_URL = import.meta.env.VITE_API_URL
// 生产环境
// export const BASE_URL = 'http://122.51.107.161:3000'

const Service = axios.create({
  baseURL: BASE_URL,
})

// axios 请求拦截器
Service.interceptors.request.use(
  config => {
    // 获取token
    const user = localStorage.getItem('userInfo')
    if (user) {
      config.headers.Authorization = JSON.parse(user).token
    }
    if (config.data) {
      // 处理data中的每一个参数，将 ' " `等转义
      config.data = escapeData(config.data)
    }
    return config
  },
  error => {
    ElMessage({
      message: '请求超时!请检查网络',
      type: 'error',
    })
    return Promise.reject(error)
  }
)
// axios respone拦截器
Service.interceptors.response.use(
  async function (response) {
    // console.log('response >>>>', response)
    console.log('response.status ===>', response.status)
    if (response.status == 200) {
      return response.data
    } else if (response.status == 401) {
      console.log('身份过期')
      ElNotification({
        type: 'error',
        message: '登录已过期, 请重新登录',
        title: 'error',
        duration: 2000,
      })
      router.push('/login')
      return response.data
    } else if (response.status == 500) {
      ElNotification({
        type: 'error',
        message: '服务器有点累~',
        title: 'error',
        duration: 2000,
      })
      return response.data
    } else if (response.status === 201) {
      return response.data
    } else {
      ElNotification({
        type: 'error',
        message: '未知错误!',
        title: 'error',
        duration: 2000,
      })
      return response.data
    }
  },
  // FIXME: token过期
  async function (error) {
    console.log('ererror.response.statusror', error.response.status)
    if (error.response.status === 401) {
      ElNotification({
        type: 'error',
        message: '登录已过期, 请重新登录',
        title: 'error',
        duration: 2000,
      })
      router.push('/login')
      return Promise.reject(error)
    }
    ElMessage({
      type: 'error',
      message: `请求出错。错误代码`,
    })
    return Promise.reject(error)
  }
)

export default Service
