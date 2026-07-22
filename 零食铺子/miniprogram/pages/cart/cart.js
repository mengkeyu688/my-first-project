const store = require('../../utils/store')

Page({
  data: {
    cart: [],
    totals: {
      goodsAmount: 0,
      deliveryFee: 0,
      discount: 0,
      payAmount: 0
    },
    allSelected: false,
    couponText: '暂无可用优惠券'
  },

  onShow() {
    this.loadCart()
  },

  loadCart() {
    const cart = store.getCart()
    const selectedItems = cart.filter(item => item.selected)
    const totals = store.calculateTotals(selectedItems, 'door')
    this.setData({
      cart,
      totals,
      allSelected: cart.length > 0 && cart.every(item => item.selected),
      couponText: totals.coupon ? `${totals.coupon.name} 已自动抵扣 ${totals.discount} 元` : '暂无可用优惠券'
    })
    this.updateBadge()
  },

  updateBadge() {
    const app = getApp()
    if (app && app.updateCartBadge) app.updateCartBadge()
  },

  toggleItem(e) {
    const item = this.data.cart.find(row => row.id === e.currentTarget.dataset.id)
    if (!item) return
    store.updateCartItem(item.id, { selected: !item.selected })
    this.loadCart()
  },

  toggleAll() {
    const selected = !this.data.allSelected
    const cart = this.data.cart.map(item => ({ ...item, selected }))
    store.saveCart(cart)
    this.loadCart()
  },

  plusQty(e) {
    const item = this.data.cart.find(row => row.id === e.currentTarget.dataset.id)
    if (!item) return
    store.updateCartItem(item.id, { qty: item.qty + 1 })
    this.loadCart()
  },

  minusQty(e) {
    const item = this.data.cart.find(row => row.id === e.currentTarget.dataset.id)
    if (!item) return
    if (item.qty <= 1) {
      store.removeCartItem(item.id)
      this.loadCart()
      return
    }
    store.updateCartItem(item.id, { qty: item.qty - 1 })
    this.loadCart()
  },

  deleteItem(e) {
    const id = e.currentTarget.dataset.id
    wx.showModal({
      title: '删除商品',
      content: '确定从购物车删除该商品吗？',
      success: res => {
        if (res.confirm) {
          store.removeCartItem(id)
          this.loadCart()
        }
      }
    })
  },

  toSubmit() {
    const selected = this.data.cart.filter(item => item.selected)
    if (!selected.length) {
      wx.showToast({ title: '请选择商品', icon: 'none' })
      return
    }
    wx.navigateTo({ url: '/pages/submit/submit' })
  },

  goDetail(e) {
    wx.navigateTo({ url: `/pages/detail/detail?id=${e.currentTarget.dataset.id}` })
  },

  goHome() {
    wx.switchTab({ url: '/pages/category/category' })
  }
})
