const api = require('../../utils/api')
const store = require('../../utils/store')

Page({
  data: {
    tabs: [
      { key: 'all', name: '全部' },
      { key: 'unpaid', name: '待付款' },
      { key: 'paid', name: '已付款' },
      { key: 'delivery', name: '配送中' },
      { key: 'finished', name: '已完成' },
      { key: 'canceled', name: '已取消' }
    ],
    activeStatus: 'all',
    allOrders: [],
    orders: [],
    starList: [1, 2, 3, 4, 5],
    evalOrderId: '',
    evalRating: 5,
    evalContent: '',
    evalImages: []
  },

  onShow() {
    this.loadOrders()
  },

  async loadOrders() {
    const user = store.getUser()
    if (!user || !user.id) {
      this.setData({ allOrders: [], orders: [] })
      return
    }
    try {
      const orderList = await api.getOrders(user.id)
      const details = await Promise.all(orderList.map(item => api.getOrderDetail(item.id).catch(() => item)))
      const allOrders = details.map(this.normalizeOrder)
      const orders = this.data.activeStatus === 'all'
        ? allOrders
        : allOrders.filter(item => item.status === this.data.activeStatus || (this.data.activeStatus === 'unpaid' && item.status === 'pending'))
      this.setData({ allOrders, orders })
    } catch (error) {
      this.setData({ allOrders: [], orders: [] })
    }
  },

  normalizeOrder(order) {
    const statusTextMap = {
      unpaid: '待付款',
      pending: '待付款',
      paid: '已付款',
      delivery: '配送中',
      finished: '已完成',
      canceled: '已取消'
    }
    return {
      ...order,
      statusText: statusTextMap[order.status] || order.status,
      address: {
        building: order.building,
        room: order.room,
        phone: order.phone
      },
      deliveryMethodText: order.deliveryMethod === 'pickup' ? '楼下自取' : '送宿舍门口',
      items: (order.items || []).map(item => ({
        productId: item.productId,
        image: item.productImage,
        name: item.productName,
        qty: item.quantity,
        subTotal: item.subtotal
      }))
    }
  },

  switchStatus(e) {
    this.setData({ activeStatus: e.currentTarget.dataset.key, evalOrderId: '' })
    this.loadOrders()
  },

  toPay(e) {
    const order = this.data.allOrders.find(item => String(item.id) === String(e.currentTarget.dataset.id))
    if (order && order.orderNo) {
      wx.navigateTo({ url: `/pages/pay/pay?orderNo=${order.orderNo}` })
      return
    }
    wx.navigateTo({ url: `/pages/pay/pay?orderId=${e.currentTarget.dataset.id}` })
  },

  async cancelOrder(e) {
    wx.showModal({
      title: '取消订单',
      content: '确定取消该订单吗？',
      success: async res => {
        if (res.confirm) {
          await api.cancelOrder(e.currentTarget.dataset.id)
          this.loadOrders()
        }
      }
    })
  },

  confirmReceive() {
    wx.showToast({ title: '确认收货接口待后端开放', icon: 'none' })
  },

  async againOrder(e) {
    try {
      const order = await api.getOrderDetail(e.currentTarget.dataset.id)
      ;(order.items || []).forEach(item => {
        store.addCart({
          id: item.productId,
          name: item.productName,
          image: item.productImage,
          price: item.price
        }, item.quantity)
      })
      wx.showToast({ title: '已加入购物车', icon: 'success' })
      wx.switchTab({ url: '/pages/cart/cart' })
    } catch (error) {}
  },

  openEval(e) {
    this.setData({
      evalOrderId: e.currentTarget.dataset.id,
      evalRating: 5,
      evalContent: '',
      evalImages: []
    })
  },

  setRating(e) {
    this.setData({ evalRating: Number(e.currentTarget.dataset.score) })
  },

  onEvalInput(e) {
    this.setData({ evalContent: e.detail.value })
  },

  chooseEvalImage() {
    wx.chooseImage({
      count: 3,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: res => {
        this.setData({ evalImages: res.tempFilePaths.slice(0, 3) })
      }
    })
  },

  submitEval() {
    wx.showToast({ title: '评价接口待后端开放', icon: 'none' })
    this.setData({ evalOrderId: '' })
  },

  goDetail(e) {
    wx.navigateTo({ url: `/pages/detail/detail?id=${e.currentTarget.dataset.id}` })
  }
})
