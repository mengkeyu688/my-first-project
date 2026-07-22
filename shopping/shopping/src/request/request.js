import axios from 'axios'
import router from '../router'
import { ElNotification } from 'element-plus'

const service = axios.create({
  baseURL: 'http://127.0.0.1:8360',
  timeout: 5000
})

service.interceptors.request.use(config => {
  const token = localStorage.getItem('myToken')

  if (token) {
    config.headers.jwt = token
  }

  return config
})
service.interceptors.response.use(
response => {
  const { errno, data, errmsg } = response.data

  if(errno === 0){
    if(errmsg !== ''){
      ElNotification({
        message: errmsg,
        type: 'success',
      })
    }
    return data
  }

  if(errno === 2){
    router.push({ name: 'login' })
    return Promise.reject(new Error(errmsg || '登录状态已失效'))
  }

  ElNotification({
    message: errmsg || '请求失败',
    type: 'error',
  })

  return Promise.reject(new Error(errmsg || '请求失败'))
},
error => {
  ElNotification({
    message: '请求失败',
    type: 'error',
  })

  return Promise.reject(error)
})

export default service
