const BASE_URL = 'http://127.0.0.1:3000'
const API_BASE = `${BASE_URL}/api`

function getToken() {
  return wx.getStorageSync('snack_token') || ''
}

function formatSalesCount(value) {
  const count = Number(value || 0)
  if (count >= 10000) return '1万+'
  if (count >= 5000) return '5000+'
  if (count >= 1000) return '1000+'
  return String(count)
}

function normalizeProduct(item) {
  if (!item) return null
  const count = Number(item.sales_count || item.sales || 0)
  const image = item.imageUrl || item.image || '/images/goods-1.png'
  return {
    id: String(item.id),
    categoryId: String(item.categoryId || item.category_id || ''),
    category: item.categoryName || item.category || '',
    categoryName: item.categoryName || item.category || '',
    name: item.name,
    image,
    images: item.images && item.images.length ? item.images : [image],
    price: Number(item.price || 0),
    originPrice: Number(item.originalPrice || item.originPrice || item.price || 0),
    stock: Number(item.stock || 0),
    sales_count: count,
    sales_count_text: formatSalesCount(count),
    desc: item.description || item.desc || '',
    shelfLife: item.shelfLife || '',
    spec: item.spec || (item.specs ? Object.keys(item.specs).map(key => `${key}: ${item.specs[key]}`).join('，') : ''),
    specs: item.specs || {},
    status: item.status
  }
}

function normalizeCategory(item) {
  return {
    id: String(item.id),
    name: item.name,
    icon: item.iconUrl || item.icon_url || '/images/cat-0.png'
  }
}

function normalizeCoupon(item) {
  const threshold = Number(item.thresholdAmount || item.threshold_amount || 0)
  const amount = Number(item.amount || 0)
  return {
    id: String(item.id),
    name: item.name,
    type: item.type,
    amount,
    threshold,
    thresholdAmount: threshold,
    desc: item.type === 'delivery' ? `配送费抵扣 ${amount} 元` : `满 ${threshold} 元减 ${amount} 元`,
    status: item.status === 1 ? 'unused' : String(item.status || 'unused'),
    expireAt: item.endAt || item.end_at || ''
  }
}

function request(options) {
  const header = Object.assign({}, options.header || {})
  const token = getToken()

  if (options.auth !== false && token) {
    header.Authorization = `Bearer ${token}`
  }

  return new Promise((resolve, reject) => {
    const url = `${API_BASE}${options.url}`
    wx.request({
      url,
      method: options.method || 'GET',
      data: options.data || {},
      header,
      success(res) {
        const body = res.data || {}
        if (res.statusCode >= 200 && res.statusCode < 300 && body.code === 0) {
          resolve(body.data)
          return
        }
        const message = body.message || `接口请求失败：${res.statusCode}`
        console.error('[api request error]', url, res.statusCode, body)
        wx.showToast({ title: message, icon: 'none' })
        reject(new Error(message))
      },
      fail(error) {
        console.error('[api request fail]', url, error)
        const message = error.errMsg || '网络请求失败'
        wx.showToast({ title: message, icon: 'none' })
        reject(error)
      }
    })
  })
}

async function loginByWechat(profile) {
  const code = await new Promise((resolve, reject) => {
    wx.login({
      success(res) {
        if (res.code) {
          resolve(res.code)
          return
        }
        reject(new Error('微信登录 code 获取失败'))
      },
      fail: reject
    })
  })

  const data = await request({
    url: '/auth/login',
    method: 'POST',
    auth: false,
    data: {
      code,
      nickname: profile && profile.nickname,
      avatarUrl: profile && profile.avatarUrl,
      phone: profile && profile.phone
    }
  })
  wx.setStorageSync('snack_token', data.token)
  wx.setStorageSync('snack_user', data.user)
  return data
}

async function loginByAdmin(account, password) {
  const data = await request({
    url: '/auth/login',
    method: 'POST',
    auth: false,
    data: {
      account,
      password
    }
  })
  wx.setStorageSync('snack_token', data.token)
  wx.setStorageSync('snack_user', data.user)
  return data
}

async function getCategories() {
  const data = await request({ url: '/categories', auth: false })
  return (data || []).map(normalizeCategory)
}

async function getProducts(params) {
  const query = buildQuery(params || {})
  const data = await request({ url: `/products${query}`, auth: false })
  return {
    list: (data.list || []).map(normalizeProduct),
    pagination: data.pagination || {}
  }
}

async function getProduct(id) {
  const data = await request({ url: `/products/${id}`, auth: false })
  return normalizeProduct(data)
}

async function createProduct(data) {
  const product = await request({
    url: '/products',
    method: 'POST',
    data
  })
  return normalizeProduct(product)
}

async function updateProduct(id, data) {
  const product = await request({
    url: `/products/${id}`,
    method: 'PUT',
    data
  })
  return normalizeProduct(product)
}

async function deleteProduct(id) {
  return request({
    url: `/products/${id}`,
    method: 'DELETE'
  })
}

async function getCoupons() {
  const data = await request({ url: '/coupons', auth: false })
  return (data || []).map(normalizeCoupon)
}

async function receiveCoupon(couponId) {
  return request({
    url: '/user-coupons',
    method: 'POST',
    data: { couponId }
  })
}

async function getUserCoupons(userId) {
  return request({ url: `/user-coupons/${userId}` })
}

async function createOrder(data) {
  return request({
    url: '/orders',
    method: 'POST',
    data
  })
}

async function createSimulatedOrder(data) {
  return request({
    url: '/order/create',
    method: 'POST',
    data
  })
}

async function simulatePay(orderNo, result) {
  return request({
    url: '/pay/simulate',
    method: 'POST',
    data: {
      orderNo,
      result: result || 'success'
    }
  })
}

async function getOrderByNo(orderNo) {
  return request({ url: `/order/${orderNo}` })
}

async function getOrders(userId) {
  return request({ url: `/orders/${userId}` })
}

async function getOrderDetail(id) {
  return request({ url: `/orders/detail/${id}` })
}

async function cancelOrder(id) {
  return request({
    url: `/orders/${id}/cancel`,
    method: 'PUT'
  })
}

function buildQuery(params) {
  const pairs = Object.keys(params)
    .filter(key => params[key] !== undefined && params[key] !== null && params[key] !== '')
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
  return pairs.length ? `?${pairs.join('&')}` : ''
}

module.exports = {
  BASE_URL,
  API_BASE,
  request,
  loginByWechat,
  loginByAdmin,
  getCategories,
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getCoupons,
  receiveCoupon,
  getUserCoupons,
  createOrder,
  createSimulatedOrder,
  simulatePay,
  getOrderByNo,
  getOrders,
  getOrderDetail,
  cancelOrder,
  normalizeProduct,
  formatSalesCount,
  normalizeCategory,
  normalizeCoupon
}
