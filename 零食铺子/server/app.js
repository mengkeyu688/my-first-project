const express = require('express')
const cors = require('cors')
const helmet = require('helmet')

const authRoutes = require('./routes/authRoutes')
const productsRoutes = require('./routes/products')
const categoryRoutes = require('./routes/categories')
const couponRoutes = require('./routes/couponRoutes')
const userCouponRoutes = require('./routes/userCouponRoutes')
const orderRoutes = require('./routes/orderRoutes')
const simulatedOrderRoutes = require('./routes/simulatedOrderRoutes')
const payRoutes = require('./routes/payRoutes')
const { notFound, errorHandler } = require('./middleware/errorHandler')

const app = express()

app.use(helmet())
app.use(cors())
app.use(express.json({ limit: '2mb' }))
app.use(express.urlencoded({ extended: true }))

app.get('/api/health', (req, res) => {
  res.json({
    code: 0,
    message: 'success',
    data: {
      status: 'ok'
    }
  })
})

app.use('/api/auth', authRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/products', productsRoutes)
app.use('/api/coupons', couponRoutes)
app.use('/api/user-coupons', userCouponRoutes)
app.use('/api/order', simulatedOrderRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/pay', payRoutes)

app.use(notFound)
app.use(errorHandler)

module.exports = app
