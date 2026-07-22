import request from './request.js'

// 登录接口
export function login(data) {
  return request.post('/admin/login', data)
}

// 用户信息接口
export function getAdmin() {
  return request.get('/admin/admin')
}

// 修改密码
export function changePassword(data) {
  return request.post('/admin/admin/changePassword', data)
}

// 修改头像
export function changeAvatar(data) {
  return request.post('/admin/admin/changeAvatar', data)
}

// 获取分类列表
export function getCategoryList() {
  return request.get('/admin/category/list')
}

// 获取单项分类
export function getCategory(id) {
  return request.get('/admin/category', {
    params: { id },
  })
}

// 新增分类
export function addCategory(data) {
  return request.post('/admin/category/add', data)
}

// 修改分类
export function saveCategory(data) {
  return request.post('/admin/category/save', data)
}

// 删除分类
export function deleteCategory(id) {
  return request.post('/admin/category/del', { id })
}

// 查询商品列表
export function getGoodsList(params) {
  return request.get('/admin/goods/list', {
    params,
  })
}

// 查询单个商品
export function getGoods(id) {
  return request.get('/admin/goods', {
    params: { id },
  })
}

// 添加商品
export function addGoods(data) {
  return request.post('/admin/goods/add', data)
}

// 修改商品
export function saveGoods(data) {
  return request.post('/admin/goods/save', data)
}

// 删除商品
export function deleteGoods(id) {
  return request.post('/admin/goods/del', { id })
}

// 文件上传
export function uploadPicture(type, file) {
  const formData = new FormData()

  formData.append('type', type)
  formData.append('file', file)

  return request.post('/admin/upload/picture', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}
