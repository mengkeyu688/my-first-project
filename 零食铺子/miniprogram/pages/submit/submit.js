const api = require('../../utils/api')
const store = require('../../utils/store')

function yuanToFen(value) {
  return Math.round(Number(value || 0) * 100)
}

Page({
  data: {
    items: [],
    cartIds: [],
    form: {
      building: '',
      room: '',
      phone: '',
      remark: ''
    },
    timeOptions: ['尽快送达', '18:00-19:00', '19:00-20:00', '20:00-21:00', '21:00-22:30'],
    timeIndex: 0,
    deliveryMethod: 'door',
    totals: {
      goodsAmount: 0,
      deliveryFee: 0,
      discount: 0,
      payAmount: 0
    },
    couponText: '优惠券由后端订单接口校验计算'
  },

  onLoad() {
    const user = store.getUser() || {}
    const form = { ...this.data.form, phone: user.phone || '' }
    const items = store.selectedCartItems()
    const cartIds = items.map(item => item.id)
    this.setData({ items, cartIds, form })
    this.calculate()
  },

  calculate() {
    const totals = store.calculateTotals(this.data.items, this.data.deliveryMethod)
    this.setData({ totals })
  },

  onFormInput(e) {
    const field = e.currentTarget.dataset.field
    this.setData({ [`form.${field}`]: e.detail.value })
  },

  onTimeChange(e) {
    this.setData({ timeIndex: Number(e.detail.value) })
  },

  switchMethod(e) {
    this.setData({ deliveryMethod: e.currentTarget.dataset.method })
    this.calculate()
  },

  async submitOrder() {
    if (!this.data.items.length) {
      wx.showToast({ title: '请选择商品', icon: 'none' })
      return
    }
    const form = this.data.form
    if (!form.building || !form.room || !form.phone) {
      wx.showToast({ title: '请补全配送信息', icon: 'none' })
      return
    }
    if (!/^1\d{10}$/.test(form.phone)) {
      wx.showToast({ title: '手机号格式不正确', icon: 'none' })
      return
    }

    try {
      const app = getApp()
      const user = await app.ensureLogin()
      user.phone = form.phone
      store.saveUser(user)

      const orderResult = await api.createSimulatedOrder({
        userId: user.id,
        items: this.data.items.map(item => ({
          productId: item.product.id,
          name: item.product.name,
          image: item.product.image,
          priceFee: yuanToFen(item.product.price),
          quantity: item.qty,
          subtotalFee: yuanToFen(item.subTotal)
        })),
        totalFee: yuanToFen(this.data.totals.payAmount),
        receiverPhone: form.phone,
        receiverBuilding: form.building,
        receiverRoom: form.room,
        building: form.building,
        room: form.room,
        phone: form.phone,
        deliveryMethod: this.data.deliveryMethod,
        deliveryTime: this.data.timeOptions[this.data.timeIndex],
        remark: form.remark
      })

      store.removeCartItems(this.data.cartIds)
      if (app && app.updateCartBadge) app.updateCartBadge()
      wx.navigateTo({ url: `/pages/pay/pay?orderNo=${orderResult.orderNo}` })
    } catch (error) {
      wx.showToast({ title: error.message || '创建订单失败', icon: 'none' })
    }
  }
})
