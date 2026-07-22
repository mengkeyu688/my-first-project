const api = require('../../utils/api')
const store = require('../../utils/store')

function blankProduct(category) {
  return {
    name: '',
    categoryId: '',
    category,
    price: '',
    originPrice: '',
    stock: '',
    desc: '',
    spec: ''
  }
}

Page({
  data: {
    logged: false,
    account: '',
    password: '',
    tabs: [
      { key: 'dashboard', name: '数据统计' },
      { key: 'products', name: '商品管理' },
      { key: 'categories', name: '分类管理' },
      { key: 'orders', name: '订单管理' },
      { key: 'users', name: '用户管理' }
    ],
    activeTab: 'dashboard',
    stats: {
      todayAmount: 0,
      weekAmount: 0,
      monthAmount: 0,
      orderCount: 0,
      userCount: 0,
      totalAmount: 0,
      hotRank: [],
      stockWarnings: []
    },
    products: [],
    categories: [],
    categoryNames: [],
    productForm: blankProduct(''),
    productCategoryIndex: 0,
    editProductId: '',
    categoryInput: '',
    editCategoryId: '',
    orders: [],
    statusOptions: ['待付款', '已付款', '配送中', '已完成', '已取消']
  },

  onLoad() {
    const session = wx.getStorageSync(store.KEY.admin)
    this.setData({ logged: !!(session && session.logged) })
  },

  onShow() {
    if (this.data.logged) this.loadAdmin()
  },

  onAccountInput(e) {
    this.setData({ account: e.detail.value })
  },

  onPasswordInput(e) {
    this.setData({ password: e.detail.value })
  },

  async login() {
    if (this.data.account === 'admin' && this.data.password === '123456') {
      try {
        await api.loginByAdmin(this.data.account, this.data.password)
      } catch (error) {
        return
      }
      wx.setStorageSync(store.KEY.admin, { logged: true, loginAt: store.nowText() })
      this.setData({ logged: true, account: '', password: '' })
      this.loadAdmin()
      wx.showToast({ title: '登录成功', icon: 'success' })
      return
    }
    wx.showToast({ title: '账号或密码错误', icon: 'none' })
  },

  logout() {
    wx.removeStorageSync(store.KEY.admin)
    this.setData({ logged: false })
  },

  switchTab(e) {
    this.setData({ activeTab: e.currentTarget.dataset.key })
    this.loadAdmin()
  },

  async loadAdmin() {
    try {
      const [categories, productResult] = await Promise.all([
        api.getCategories(),
        api.getProducts({ page: 1, pageSize: 100 })
      ])
      const products = productResult.list || []
      const categoryNames = categories.map(item => item.name)
      const totalAmount = 0
      this.setData({
        categories,
        categoryNames,
        products,
        orders: [],
        stats: {
          userCount: 0,
          orderCount: 0,
          totalAmount,
          todayAmount: 0,
          weekAmount: 0,
          monthAmount: 0,
          hotRank: products.slice().sort((a, b) => b.sales_count - a.sales_count).slice(0, 10).map(item => ({
            id: item.id,
            name: item.name,
            image: item.image,
            qty: item.sales_count
          })),
          stockWarnings: products.filter(item => item.stock <= 20).slice(0, 10)
        },
        productCategoryIndex: Math.max(0, categoryNames.indexOf(this.data.productForm.category))
      })
    } catch (error) {
      this.setData({ categories: [], categoryNames: [], products: [], orders: [] })
    }
  },

  onProductInput(e) {
    const field = e.currentTarget.dataset.field
    this.setData({ [`productForm.${field}`]: e.detail.value })
  },

  onProductCategoryChange(e) {
    const index = Number(e.detail.value)
    const category = this.data.categories[index]
    this.setData({
      productCategoryIndex: index,
      'productForm.category': category ? category.name : '',
      'productForm.categoryId': category ? category.id : ''
    })
  },

  async saveProduct() {
    const form = this.data.productForm
    const category = this.data.categories[this.data.productCategoryIndex]
    const categoryId = form.categoryId || (category && category.id)
    if (!form.name || !categoryId || !form.price) {
      wx.showToast({ title: '请补全商品信息', icon: 'none' })
      return
    }

    const payload = {
      categoryId,
      name: form.name,
      imageUrl: '/images/goods-1.png',
      images: ['/images/goods-1.png'],
      price: Number(form.price),
      originalPrice: Number(form.originPrice || form.price),
      stock: Number(form.stock || 0),
      description: form.desc || '',
      shelfLife: '以包装标识为准',
      specs: { spec: form.spec || '标准规格' },
      status: 1
    }

    try {
      if (this.data.editProductId) {
        await api.updateProduct(this.data.editProductId, payload)
      } else {
        await api.createProduct(payload)
      }
      wx.showToast({ title: this.data.editProductId ? '已保存' : '已新增', icon: 'success' })
      this.resetProductForm()
      this.loadAdmin()
    } catch (error) {}
  },

  editProduct(e) {
    const product = this.data.products.find(item => String(item.id) === String(e.currentTarget.dataset.id))
    if (!product) return
    const categoryIndex = this.data.categories.findIndex(item => String(item.id) === String(product.categoryId))
    this.setData({
      editProductId: product.id,
      productCategoryIndex: categoryIndex >= 0 ? categoryIndex : 0,
      productForm: {
        name: product.name,
        categoryId: product.categoryId,
        category: product.category,
        price: product.price,
        originPrice: product.originPrice,
        stock: product.stock,
        desc: product.desc,
        spec: product.spec
      }
    })
    wx.pageScrollTo({ scrollTop: 0, duration: 200 })
  },

  resetProductForm() {
    const first = this.data.categories[0]
    this.setData({
      editProductId: '',
      productForm: blankProduct(first ? first.name : ''),
      productCategoryIndex: 0
    })
  },

  async removeProduct(e) {
    const id = e.currentTarget.dataset.id
    wx.showModal({
      title: '删除商品',
      content: '确定删除该商品吗？',
      success: async res => {
        if (res.confirm) {
          await api.deleteProduct(id)
          this.loadAdmin()
        }
      }
    })
  },

  async toggleShelf(e) {
    const product = this.data.products.find(item => String(item.id) === String(e.currentTarget.dataset.id))
    if (!product) return
    await api.updateProduct(product.id, { status: product.status === 1 ? 0 : 1 })
    this.loadAdmin()
  },

  async changeStock(e) {
    const id = e.currentTarget.dataset.id
    const type = e.currentTarget.dataset.type
    const product = this.data.products.find(item => String(item.id) === String(id))
    if (!product) return
    await api.updateProduct(id, { stock: Math.max(0, Number(product.stock || 0) + (type === 'plus' ? 1 : -1)) })
    this.loadAdmin()
  },

  onCategoryInput(e) {
    this.setData({ categoryInput: e.detail.value })
  },

  saveCategory() {
    wx.showToast({ title: '分类写入接口待后端开放', icon: 'none' })
  },

  editCategory(e) {
    const category = this.data.categories.find(item => String(item.id) === String(e.currentTarget.dataset.id))
    if (!category) return
    this.setData({ editCategoryId: category.id, categoryInput: category.name })
  },

  removeCategory() {
    wx.showToast({ title: '分类删除接口待后端开放', icon: 'none' })
  },

  resetCategoryForm() {
    this.setData({ editCategoryId: '', categoryInput: '' })
  },

  changeOrderStatus() {
    wx.showToast({ title: '订单状态接口待后端开放', icon: 'none' })
  }
})
