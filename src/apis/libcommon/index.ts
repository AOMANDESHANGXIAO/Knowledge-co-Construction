/*
 * @Author       : ridiculous adventurer
 * @Version      : V1.0
 * @Date         : 2024-07-13 13:07:59
 * @Description  : 
 */

interface Response<T=any> {
  message: string
  success: boolean
  data: T
  [propName: string]: any
}

export type {
  Response
}