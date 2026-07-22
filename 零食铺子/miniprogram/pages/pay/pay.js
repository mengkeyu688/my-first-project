const api = require('../../utils/api')

function fenToYuan(value) {
  return (Number(value || 0) / 100).toFixed(2)
}

function statusText(status) {
  const map = {
    unpaid: '待支付',
    pending: '待付款',
    paid: '已支付',
    delivery: '配送中',
    finished: '已完成',
    canceled: '已取消',
    cancelled: '已取消'
  }
  return map[status] || status || ''
}

Page({
  data: {
    orderNo: '',
    order: {},
    paying: false,
    payText: '确认支付'
  },

  pollTimer: null,

  onLoad(options) {
    if (options.orderNo) {
      this.setData({ orderNo: options.orderNo })
      this.loadOrder(options.orderNo)
      return
    }
    if (options.orderId) {
      this.loadLegacyOrder(options.orderId)
    }
  },

  onUnload() {
    this.clearPoll()
  },

  async loadOrder(orderNo) {
    try {
      const order = await api.getOrderByNo(orderNo)
      this.setData({ order: this.formatOrder(order), orderNo: order.orderNo })
    } catch (error) {
      this.setData({ order: {} })
    }
  },

  async loadLegacyOrder(orderId) {
    try {
      const order = await api.getOrderDetail(orderId)
      this.setData({ order: this.formatOrder(order), orderNo: order.orderNo || '' })
    } catch (error) {
      this.setData({ order: {} })
    }
  },

  formatOrder(order) {
    const totalFee = order.totalFee !== undefined
      ? order.totalFee
      : Math.round(Number(order.payAmount || order.totalAmount || 0) * 100)
    return {
      ...order,
      totalFee,
      totalAmountText: fenToYuan(totalFee),
      statusText: statusText(order.status),
      items: order.items || []
    }
  },

  async payOrder() {
    if (!this.data.orderNo || this.data.paying) return
    await this.startPayment('success')
  },

  async simulateFail() {
    if (!this.data.orderNo || this.data.paying) return
    await this.startPayment('fail')
  },

  async simulateCancel() {
    if (!this.data.orderNo || this.data.paying) return
    await this.startPayment('cancel')
  },

  async startPayment(result) {
    this.setData({ paying: true, payText: '支付处理中...' })
    wx.showLoading({ title: '支付处理中...' })

    try {
      await api.simulatePay(this.data.orderNo, result)
      if (result === 'cancel') {
        wx.hideLoading()
        wx.showToast({ title: '已取消支付', icon: 'none' })
        this.setData({ paying: false, payText: '确认支付' })
        this.loadOrder(this.data.orderNo)
        return
      }
      this.pollPaidStatus(0)
    } catch (error) {
      wx.hideLoading()
      wx.showToast({ title: error.message || '支付失败', icon: 'none' })
      this.setData({ paying: false, payText: '确认支付' })
    }
  },

  pollPaidStatus(count) {
    this.clearPoll()
    this.pollTimer = setTimeout(async () => {
      try {
        const order = await api.getOrderByNo(this.data.orderNo)
        const nextOrder = this.formatOrder(order)
        this.setData({ order: nextOrder })

        if (nextOrder.status === 'paid') {
          wx.hideLoading()
          this.setData({ paying: false, payText: '已支付' })
          wx.redirectTo({ url: `/pages/pay-success/pay-success?orderNo=${nextOrder.orderNo}` })
          return
        }

        if (nextOrder.status === 'cancelled' || nextOrder.status === 'canceled') {
          wx.hideLoading()
          wx.showToast({ title: '支付已取消', icon: 'none' })
          this.setData({ paying: false, payText: '确认支付' })
          return
        }

        if (count >= 10) {
          wx.hideLoading()
          wx.showToast({ title: '支付超时，请重试', icon: 'none' })
          this.setData({ paying: false, payText: '确认支付' })
          return
        }

        this.pollPaidStatus(count + 1)
      } catch (error) {
        wx.hideLoading()
        wx.showToast({ title: '支付状态查询失败', icon: 'none' })
        this.setData({ paying: false, payText: '确认支付' })
      }
    }, 800)
  },

  clearPoll() {
    if (this.pollTimer) {
      clearTimeout(this.pollTimer)
      this.pollTimer = null
    }
  },

  backOrder() {
    wx.switchTab({ url: '/pages/order/order' })
  }
})
