const api = require('../../utils/api')
const store = require('../../utils/store')

Page({
  data: {
    user: {},
    orderCount: 0,
    favoriteCount: 0,
    couponCount: 0,
    browseCount: 0,
    browseProducts: [],
    redeemList: [],
    menus: [
      { key: 'orders', name: '我的订单' },
      { key: 'favorite', name: '我的收藏' },
      { key: 'coupon', name: '优惠券' },
      { key: 'history', name: '浏览记录' },
      { key: 'service', name: '联系客服' },
      { key: 'feedback', name: '意见反馈' },
      { key: 'about', name: '关于我们' },
      { key: 'admin', name: '管理员后台' }
    ]
  },

  onShow() {
    this.loadMine()
  },

  async loadMine() {
    const user = store.getUser() || {
      avatarUrl: '/images/avatar.png',
      avatar: '/images/avatar.png',
      nickname: '未登录用户',
      nickName: '未登录用户',
      points: 0
    }
    const browseProducts = store.getBrowseProducts()
    let orderCount = 0
    let couponCount = 0

    try {
      const coupons = await api.getCoupons()
      couponCount = coupons.length
    } catch (error) {}

    if (user.id) {
      try {
        const orders = await api.getOrders(user.id)
        orderCount = orders.length
      } catch (error) {}
    }

    this.setData({
      user: {
        ...user,
        avatar: user.avatar || user.avatarUrl || '/images/avatar.png',
        nickName: user.nickName || user.nickname || '未登录用户'
      },
      orderCount,
      favoriteCount: (wx.getStorageSync(store.KEY.favorites) || []).length,
      couponCount,
      browseCount: browseProducts.length,
      browseProducts
    })
  },

  async login() {
    try {
      const app = getApp()
      await app.ensureLogin()
      this.loadMine()
    } catch (error) {
      wx.showToast({ title: error.message || '登录失败', icon: 'none' })
    }
  },

  goOrders() {
    wx.switchTab({ url: '/pages/order/order' })
  },

  goFavorite() {
    wx.navigateTo({ url: '/pages/favorite/favorite' })
  },

  goCoupon() {
    wx.navigateTo({ url: '/pages/coupon/coupon' })
  },

  goDetail(e) {
    wx.navigateTo({ url: `/pages/detail/detail?id=${e.currentTarget.dataset.id}` })
  },

  redeem() {
    wx.showToast({ title: '积分兑换接口待后端开放', icon: 'none' })
  },

  tapMenu(e) {
    const key = e.currentTarget.dataset.key
    if (key === 'orders') return this.goOrders()
    if (key === 'favorite') return this.goFavorite()
    if (key === 'coupon') return this.goCoupon()
    if (key === 'history') {
      wx.showToast({ title: '浏览记录已展示在本页底部', icon: 'none' })
      return
    }
    if (key === 'service') {
      wx.showModal({ title: '联系客服', content: '宿舍零食商城客服微信：snack-campus' })
      return
    }
    if (key === 'feedback') {
      wx.showModal({ title: '意见反馈', content: '感谢反馈，后续可接入表单或客服消息接口。' })
      return
    }
    if (key === 'about') {
      wx.showModal({ title: '关于我们', content: '宿舍零食商城已切换为 Node.js + MySQL 后端接口。' })
      return
    }
    if (key === 'admin') {
      wx.navigateTo({ url: '/pages/admin/admin' })
    }
  }
})
