const KEY = {
  cart: 'snack_cart',
  favorites: 'snack_favorites',
  browse: 'snack_browse_history',
  user: 'snack_user',
  token: 'snack_token',
  search: 'snack_search_history',
  admin: 'snack_admin_session'
}

function clone(data) {
  return JSON.parse(JSON.stringify(data))
}

function read(key, fallback) {
  const data = wx.getStorageSync(key)
  if (data === '' || data === undefined || data === null) {
    return clone(fallback)
  }
  return data
}

function write(key, data) {
  wx.setStorageSync(key, data)
  return data
}

function initStore() {
  if (!wx.getStorageSync(KEY.cart)) write(KEY.cart, [])
  if (!wx.getStorageSync(KEY.favorites)) write(KEY.favorites, [])
  if (!wx.getStorageSync(KEY.browse)) write(KEY.browse, [])
  if (!wx.getStorageSync(KEY.search)) write(KEY.search, [])
}

function money(value) {
  return Number(Number(value || 0).toFixed(2))
}

function nowText() {
  const date = new Date()
  const pad = n => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function getUser() {
  return read(KEY.user, null)
}

function saveUser(user) {
  return write(KEY.user, user)
}

function getToken() {
  return read(KEY.token, '')
}

function saveToken(token) {
  return write(KEY.token, token)
}

function getCart() {
  return read(KEY.cart, []).map(item => {
    const product = item.product || {}
    const linePrice = item.redeem ? 0 : Number(product.price || item.price || 0)
    return {
      ...item,
      product,
      linePrice,
      subTotal: money(linePrice * Number(item.qty || 0))
    }
  })
}

function saveCart(cart) {
  return write(KEY.cart, cart.map(item => ({
    id: item.id,
    productId: String(item.productId),
    qty: Number(item.qty || 1),
    selected: item.selected !== false,
    redeem: !!item.redeem,
    product: item.product || null
  })))
}

function addCart(product, qty, options) {
  const productId = String(product.id || product.productId)
  const cart = getCart()
  const redeem = options && options.redeem
  const exist = cart.find(item => String(item.productId) === productId && !!item.redeem === !!redeem)

  if (exist) {
    exist.qty += Number(qty || 1)
    exist.selected = true
    exist.product = product
  } else {
    cart.unshift({
      id: `cart_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      productId,
      qty: Number(qty || 1),
      selected: true,
      redeem: !!redeem,
      product
    })
  }
  saveCart(cart)
  return getCart()
}

function updateCartItem(id, patch) {
  const cart = getCart().map(item => {
    if (item.id !== id) return item
    return {
      ...item,
      ...patch,
      qty: Math.max(1, Number(patch.qty || item.qty || 1))
    }
  })
  saveCart(cart)
  return getCart()
}

function removeCartItem(id) {
  saveCart(getCart().filter(item => item.id !== id))
  return getCart()
}

function removeCartItems(ids) {
  saveCart(getCart().filter(item => !ids.includes(item.id)))
  return getCart()
}

function selectedCartItems() {
  return getCart().filter(item => item.selected)
}

function getCartTotal() {
  return getCart().reduce((sum, item) => sum + Number(item.qty || 0), 0)
}

function getSearchHistory() {
  return read(KEY.search, [])
}

function addSearchHistory(keyword) {
  const text = String(keyword || '').trim()
  if (!text) return getSearchHistory()
  const history = getSearchHistory().filter(item => item !== text)
  history.unshift(text)
  return write(KEY.search, history.slice(0, 8))
}

function clearSearchHistory() {
  return write(KEY.search, [])
}

function getFavoriteIds() {
  return read(KEY.favorites, [])
}

function isFavorite(productId) {
  return getFavoriteIds().includes(String(productId))
}

function toggleFavorite(productId) {
  const id = String(productId)
  const favorites = getFavoriteIds()
  const index = favorites.indexOf(id)
  if (index >= 0) {
    favorites.splice(index, 1)
  } else {
    favorites.unshift(id)
  }
  write(KEY.favorites, favorites)
  return favorites.includes(id)
}

function addBrowse(product) {
  if (!product || !product.id) return []
  const list = read(KEY.browse, []).filter(item => String(item.id) !== String(product.id))
  list.unshift(product)
  write(KEY.browse, list.slice(0, 20))
  return list
}

function getBrowseProducts() {
  return read(KEY.browse, [])
}

function calculateTotals(items, deliveryMethod) {
  const goodsAmount = money(items.reduce((sum, item) => {
    const product = item.product || {}
    const price = item.redeem ? 0 : Number(product.price || item.price || 0)
    return sum + price * Number(item.qty || 0)
  }, 0))
  const deliveryFee = deliveryMethod === 'pickup' || goodsAmount === 0 ? 0 : 2
  return {
    goodsAmount,
    deliveryFee,
    coupon: null,
    discount: 0,
    payAmount: money(goodsAmount + deliveryFee)
  }
}

module.exports = {
  KEY,
  initStore,
  money,
  nowText,
  getUser,
  saveUser,
  getToken,
  saveToken,
  getCart,
  saveCart,
  addCart,
  updateCartItem,
  removeCartItem,
  removeCartItems,
  selectedCartItems,
  getCartTotal,
  getSearchHistory,
  addSearchHistory,
  clearSearchHistory,
  toggleFavorite,
  isFavorite,
  addBrowse,
  getBrowseProducts,
  calculateTotals
}
