// src/http/axios.js
import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from '@/router'
import { escapeData } from '@/utils/escapeHandler'

axios.defaults.timeout = 10000 // 请求超时时间

const Service = axios.create({
  baseURL: 'http://127.0.0.1:8000',
  // baseURL: 'http://122.51.107.161:8000',
})

// axios 请求拦截器
Service.interceptors.request.use(
  config => {
    // 获取token
    const user = localStorage.getItem('user')
    if (user) {
      config.headers.Authorization = JSON.parse(user)?.userInfo.token
    }
    if (config.data) {
      // 处理data中的每一个参数，将 ' " `等转义
      config.data = escapeData(config.data)
      console.log('config.data ===> ', config.data)
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
  function (response){
    console.log(response)
    if (response.status == 200) {
      return response.data
    } else if (response.status == 401) {
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
  function (error) {
    ElMessage({
      type: 'error',
      message: `请求出错。错误代码`,
    })
    return Promise.reject(error)
  }
)

export default Service
