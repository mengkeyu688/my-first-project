const api = require('../../utils/api')

function fenToYuan(value) {
  return (Number(value || 0) / 100).toFixed(2)
}

Page({
  data: {
    orderNo: '',
    order: {}
  },

  onLoad(options) {
    if (options.orderNo) {
      this.setData({ orderNo: options.orderNo })
      this.loadOrder(options.orderNo)
    }
  },

  async loadOrder(orderNo) {
    try {
      const order = await api.getOrderByNo(orderNo)
      this.setData({
        order: {
          ...order,
          totalAmountText: fenToYuan(order.totalFee),
          items: order.items || []
        }
      })
    } catch (error) {
      wx.showToast({ title: '订单详情加载失败', icon: 'none' })
    }
  },

  goOrder() {
    wx.switchTab({ url: '/pages/order/order' })
  },

  goHome() {
    wx.switchTab({ url: '/pages/category/category' })
  }
})
