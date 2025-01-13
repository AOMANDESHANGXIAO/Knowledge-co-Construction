import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from '@/router'
import { escapeData } from '@/utils/escapeHandler'
import { useUserStore } from '@/store/modules/user'
// 定义请求超时时间
axios.defaults.timeout = 10000
// 定义请求返回格式
export type Response<T = any> = Promise<{
  data: T
  message: string
  success: boolean
  code: number
}>
// 请求的URL
export const BASE_URL = import.meta.env.VITE_API_URL

const Service = axios.create({
  baseURL: BASE_URL
})
// 获取token方法
const { getToken } = useUserStore()

// axios 请求拦截器
Service.interceptors.request.use(
  config => {
    config.headers.Authorization = getToken()

    if (config.data) {
      // 处理data中的每一个参数，将 ' " `等转义
      config.data = escapeData(config.data)
    }
    return config
  },
  error => {
    ElMessage({
      message: '请求超时!请检查网络',
      type: 'error'
    })
    return Promise.reject(error)
  }
)
const SUCCESS_STATUS_GET_CODE = 200
const SUCCESS_STATUS_POST_CODE = 201
const TOKEN_UNAUTHORIZED_CODE = 401
const SERVER_ERROR_CODE = 500

// axios respone拦截器
Service.interceptors.response.use(
  async function (response) {
    if (response.status == SUCCESS_STATUS_GET_CODE || response.status == SUCCESS_STATUS_POST_CODE) {
      return response.data
    } else if (response.status == TOKEN_UNAUTHORIZED_CODE) {
      ElNotification({
        type: 'error',
        message: '登录已过期, 请重新登录',
        title: 'error',
        duration: 2000
      })
      router.push('/login')
      return response.data
    } else if (response.status == SERVER_ERROR_CODE) {
      ElNotification({
        type: 'error',
        message: '服务器有点累~',
        title: 'error',
        duration: 2000
      })
      return response.data
    } else {
      ElNotification({
        type: 'error',
        message: '未知错误!',
        title: 'error',
        duration: 2000
      })
      return response.data
    }
  },
  // FIXME: token过期
  async function (error) {
    if (error.response.status === TOKEN_UNAUTHORIZED_CODE) {
      ElNotification({
        type: 'error',
        message: '登录已过期, 请重新登录',
        title: 'error',
        duration: 2000
      })
      router.push('/login')
      return Promise.reject(error)
    }
    ElMessage({
      type: 'error',
      message: `请求出错。错误代码`
    })
    return Promise.reject(error)
  }
)

export default Service
