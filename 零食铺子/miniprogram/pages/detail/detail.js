const api = require('../../utils/api')
const store = require('../../utils/store')

Page({
  data: {
    product: null,
    isFavorite: false
  },

  onLoad(options) {
    this.loadProduct(options.id)
  },

  onShow() {
    if (this.data.product) {
      this.setData({ isFavorite: store.isFavorite(this.data.product.id) })
    }
  },

  async loadProduct(id) {
    try {
      const product = await api.getProduct(id)
      if (product) store.addBrowse(product)
      this.setData({
        product,
        isFavorite: product ? store.isFavorite(product.id) : false
      })
    } catch (error) {
      this.setData({ product: null })
    }
  },

  toggleFavorite() {
    const product = this.data.product
    if (!product) return
    const isFavorite = store.toggleFavorite(product.id)
    this.setData({ isFavorite })
    wx.showToast({ title: isFavorite ? '已收藏' : '已取消', icon: 'none' })
  },

  addCart() {
    if (!this.data.product) return
    store.addCart(this.data.product, 1)
    const app = getApp()
    if (app && app.updateCartBadge) app.updateCartBadge()
    wx.showToast({ title: '已加入购物车', icon: 'success' })
  },

  buyNow() {
    if (!this.data.product) return
    store.addCart(this.data.product, 1)
    wx.navigateTo({ url: '/pages/submit/submit' })
  },

  onShareAppMessage() {
    const product = this.data.product || {}
    return {
      title: product.name || '宿舍零食商城',
      path: `/pages/detail/detail?id=${product.id || ''}`,
      imageUrl: product.image || '/images/goods-1.png'
    }
  }
})
