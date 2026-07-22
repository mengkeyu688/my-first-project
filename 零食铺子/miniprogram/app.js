const store = require('./utils/store')
const api = require('./utils/api')

App({
  globalData: {
    userInfo: null,
    cartBadgeText: '',
    cartBadgeTimer: null
  },

  onLaunch() {
    store.initStore()
    this.globalData.userInfo = store.getUser()
  },

  async ensureLogin() {
    const user = store.getUser()
    const token = store.getToken()
    if (user && token) {
      this.globalData.userInfo = user
      return user
    }
    const data = await api.loginByWechat()
    this.globalData.userInfo = data.user
    return data.user
  },

  getCartTotal() {
    const cart = wx.getStorageSync(store.KEY.cart) || []
    return cart.reduce((sum, item) => sum + Number(item.qty || 0), 0)
  },

  isDevtools() {
    try {
      const info = wx.getSystemInfoSync()
      return info.platform === 'devtools'
    } catch (error) {
      return true
    }
  },

  updateCartBadge() {
    const total = this.getCartTotal()
    const nextText = total > 0 ? (total > 99 ? '99+' : String(total)) : ''
    const prevText = this.globalData.cartBadgeText

    if (nextText === prevText) return
    if (!nextText && !prevText) return

    if (this.isDevtools()) {
      this.globalData.cartBadgeText = nextText
      return
    }

    if (this.globalData.cartBadgeTimer) {
      clearTimeout(this.globalData.cartBadgeTimer)
    }

    this.globalData.cartBadgeTimer = setTimeout(() => {
      if (nextText) {
        try {
          wx.setTabBarBadge({
            index: 2,
            text: nextText,
            success: () => {
              this.globalData.cartBadgeText = nextText
            },
            fail: () => {}
          })
        } catch (error) {}
        return
      }

      try {
        wx.removeTabBarBadge({
          index: 2,
          success: () => {
            this.globalData.cartBadgeText = ''
          },
          fail: () => {}
        })
      } catch (error) {}
    }, 1000)
  }
})
