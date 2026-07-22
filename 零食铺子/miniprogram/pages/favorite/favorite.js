const api = require('../../utils/api')
const store = require('../../utils/store')

Page({
  data: {
    products: []
  },

  onShow() {
    this.loadFavorites()
  },

  async loadFavorites() {
    const ids = wx.getStorageSync(store.KEY.favorites) || []
    const products = []
    for (const id of ids) {
      try {
        const product = await api.getProduct(id)
        if (product) products.push(product)
      } catch (error) {}
    }
    this.setData({ products })
  },

  goDetail(e) {
    wx.navigateTo({ url: `/pages/detail/detail?id=${e.currentTarget.dataset.id}` })
  },

  removeFavorite(e) {
    store.toggleFavorite(e.currentTarget.dataset.id)
    this.loadFavorites()
    wx.showToast({ title: '已取消收藏', icon: 'none' })
  }
})
