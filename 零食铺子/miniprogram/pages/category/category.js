const api = require('../../utils/api')
const store = require('../../utils/store')

const HOT_CATEGORY_ID = 'hot'
const MAX_PRODUCTS_PER_CATEGORY = 4

Page({
  data: {
    categories: [],
    activeCategoryId: HOT_CATEGORY_ID,
    keyword: '',
    scrollIntoView: '',
    allProducts: [],
    productSections: []
  },

  onLoad() {
    this.sectionPositions = []
    this.currentScrollTop = 0
    this.loadPageData()
  },

  onShow() {
    const filter = wx.getStorageSync('snack_category_filter')
    if (filter) {
      wx.removeStorageSync('snack_category_filter')
      if (filter.keyword) this.setData({ keyword: filter.keyword, activeCategoryId: HOT_CATEGORY_ID, scrollIntoView: '' })
      if (filter.categoryId) this.setData({ activeCategoryId: String(filter.categoryId), keyword: '', scrollIntoView: '' })
      if (filter.hot) this.setData({ activeCategoryId: HOT_CATEGORY_ID, keyword: '', scrollIntoView: '' })
    }
    if (this.data.allProducts.length) this.rebuildSections()
    this.updateBadge()
  },

  async loadPageData() {
    try {
      const [categories, products] = await Promise.all([
        api.getCategories(),
        this.loadAllProducts()
      ])
      this.setData({
        categories: categories.map(item => ({ ...item, id: String(item.id) })),
        allProducts: products || []
      }, () => {
        this.rebuildSections()
      })
    } catch (error) {
      this.setData({ categories: [], allProducts: [], productSections: [] })
    }
  },

  async loadAllProducts() {
    const pageSize = 100
    let page = 1
    let products = []

    while (page <= 20) {
      const result = await api.getProducts({ page, pageSize, status: 1 })
      const list = result.list || []
      products = products.concat(list)

      const total = Number(result.pagination && result.pagination.total)
      if (!list.length || list.length < pageSize || (total && products.length >= total)) break
      page += 1
    }

    return products
  },

  rebuildSections() {
    const keyword = this.data.keyword.trim().toLowerCase()
    const products = this.withCartQty(this.data.allProducts)
    const visibleProducts = keyword
      ? products.filter(item => {
        const text = `${item.name || ''} ${item.desc || ''} ${item.category || ''} ${item.categoryName || ''}`.toLowerCase()
        return text.includes(keyword)
      })
      : products

    const hotProducts = visibleProducts
      .slice()
      .sort((a, b) => Number(b.sales_count || 0) - Number(a.sales_count || 0))
      .slice(0, 10)

    const sections = [{
      id: HOT_CATEGORY_ID,
      name: '热销榜',
      products: hotProducts
    }]

    this.data.categories.forEach(category => {
      const categoryId = String(category.id)
      sections.push({
        id: categoryId,
        name: category.name,
        products: visibleProducts.filter(product => String(product.categoryId) === categoryId)
      })
    })

    const productSections = (keyword ? sections.filter(item => item.products.length) : sections).map(category => ({
      ...category,
      products: category.products.slice(0, MAX_PRODUCTS_PER_CATEGORY)
    }))
    const activeCategoryId = productSections.some(item => item.id === this.data.activeCategoryId)
      ? this.data.activeCategoryId
      : ((productSections[0] && productSections[0].id) || HOT_CATEGORY_ID)

    this.setData({
      productSections,
      activeCategoryId
    }, () => {
      this.measureSectionPositions()
    })
  },

  measureSectionPositions() {
    clearTimeout(this.measureTimer)
    this.measureTimer = setTimeout(() => {
      const query = wx.createSelectorQuery().in(this)
      query.select('.goods-list').boundingClientRect()
      query.selectAll('.goods-section').boundingClientRect()
      query.exec(res => {
        const container = res[0]
        const rects = res[1] || []
        if (!container || !rects.length) return
        const scrollTop = Number(this.currentScrollTop || 0)
        this.sectionPositions = rects.map(rect => ({
          id: String(rect.id || '').replace('category-', ''),
          top: Math.max(0, rect.top - container.top + scrollTop)
        })).filter(item => item.id)
        this.updateActiveCategoryByScroll(scrollTop)
      })
    }, 80)
  },

  onGoodsScroll(e) {
    this.currentScrollTop = Number(e.detail.scrollTop || 0)
    if (this.scrollTimer) return
    this.scrollTimer = setTimeout(() => {
      this.scrollTimer = null
      this.updateActiveCategoryByScroll(this.currentScrollTop)
    }, 30)
  },

  updateActiveCategoryByScroll(scrollTop) {
    const positions = this.sectionPositions || []
    if (!positions.length) return

    const anchorTop = Number(scrollTop || 0) + this.getRpx(80)
    let active = positions[0]
    positions.forEach(item => {
      if (item.top <= anchorTop) active = item
    })

    if (active && active.id && active.id !== this.data.activeCategoryId) {
      this.setData({ activeCategoryId: active.id })
    }
  },

  getRpx(value) {
    if (!this.rpxRatio) {
      const info = wx.getSystemInfoSync()
      this.rpxRatio = info.windowWidth / 750
    }
    return value * this.rpxRatio
  },

  getCartQtyMap() {
    const map = {}
    store.getCart().filter(item => !item.redeem).forEach(item => {
      map[item.productId] = (map[item.productId] || 0) + Number(item.qty || 0)
    })
    return map
  },

  withCartQty(products) {
    const map = this.getCartQtyMap()
    return products.map(item => ({
      ...item,
      categoryId: String(item.categoryId),
      cartQty: map[item.id] || 0
    }))
  },

  updateBadge() {
    const app = getApp()
    if (app && app.updateCartBadge) app.updateCartBadge()
  },

  switchCategory(e) {
    const categoryId = String(e.currentTarget.dataset.id || HOT_CATEGORY_ID)
    this.setData({
      activeCategoryId: categoryId,
      scrollIntoView: ''
    }, () => {
      this.setData({ scrollIntoView: `category-${categoryId}` })
    })
  },

  onKeywordInput(e) {
    this.currentScrollTop = 0
    this.setData({ keyword: e.detail.value, scrollIntoView: '' }, () => {
      this.rebuildSections()
    })
  },

  searchGoods(e) {
    const keyword = (e.detail.value || this.data.keyword).trim()
    if (keyword) store.addSearchHistory(keyword)
    this.currentScrollTop = 0
    this.setData({ keyword, scrollIntoView: '' }, () => {
      this.rebuildSections()
    })
  },

  clearKeyword() {
    this.currentScrollTop = 0
    this.setData({ keyword: '', scrollIntoView: '' }, () => {
      this.rebuildSections()
    })
  },

  goDetail(e) {
    wx.navigateTo({ url: `/pages/detail/detail?id=${e.currentTarget.dataset.id}` })
  },

  findProduct(id) {
    return this.data.allProducts.find(item => String(item.id) === String(id))
  },

  increaseCart(e) {
    const product = this.findProduct(e.currentTarget.dataset.id)
    if (!product) return
    store.addCart(product, 1)
    this.rebuildSections()
    this.updateBadge()
  },

  decreaseCart(e) {
    const id = e.currentTarget.dataset.id
    const item = store.getCart().find(row => String(row.productId) === String(id) && !row.redeem)
    if (!item) return
    if (item.qty <= 1) {
      store.removeCartItem(item.id)
    } else {
      store.updateCartItem(item.id, { qty: item.qty - 1 })
    }
    this.rebuildSections()
    this.updateBadge()
  },

  noop() {}
})
