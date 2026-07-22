const api = require('../../utils/api')

Page({
  data: {
    coupons: []
  },

  onShow() {
    this.loadCoupons()
  },

  async loadCoupons() {
    try {
      const coupons = await api.getCoupons()
      this.setData({ coupons })
    } catch (error) {
      this.setData({ coupons: [] })
    }
  }
})
