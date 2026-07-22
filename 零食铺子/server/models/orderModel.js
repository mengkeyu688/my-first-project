const db = require('../config/db')

function mapOrder(row) {
  if (!row) return null
  return {
    id: row.id,
    orderNo: row.order_no,
    userId: row.user_id,
    status: row.status,
    goodsAmount: Number(row.goods_amount),
    deliveryFee: Number(row.delivery_fee),
    discountAmount: Number(row.discount_amount),
    payAmount: Number(row.pay_amount),
    couponId: row.coupon_id,
    userCouponId: row.user_coupon_id,
    building: row.building,
    room: row.room,
    phone: row.phone,
    deliveryMethod: row.delivery_method,
    deliveryTime: row.delivery_time,
    remark: row.remark,
    createdAt: row.created_at,
    paidAt: row.paid_at,
    canceledAt: row.canceled_at,
    finishedAt: row.finished_at
  }
}

function mapOrderItem(row) {
  return {
    id: row.id,
    orderId: row.order_id,
    productId: row.product_id,
    productName: row.product_name,
    productImage: row.product_image,
    price: Number(row.price),
    quantity: row.quantity,
    subtotal: Number(row.subtotal)
  }
}

function money(value) {
  return Number(Number(value || 0).toFixed(2))
}

function orderNo() {
  const date = new Date()
  const pad = n => String(n).padStart(2, '0')
  const stamp = `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`
  return `SN${stamp}${Math.floor(Math.random() * 100000).toString().padStart(5, '0')}`
}

function calcCouponDiscount(coupon, goodsAmount, deliveryFee) {
  if (!coupon) return 0
  if (coupon.type === 'delivery') return money(Math.min(Number(coupon.amount), deliveryFee))
  if (goodsAmount >= Number(coupon.threshold_amount || 0)) return money(coupon.amount)
  return 0
}

async function create(data) {
  return db.transaction(async connection => {
    const userId = data.userId
    const items = data.items || []
    if (!items.length) {
      const error = new Error('items is required')
      error.status = 400
      throw error
    }

    const orderItems = []
    let goodsAmount = 0

    for (const item of items) {
      const quantity = Math.max(Number(item.quantity || 1), 1)
      const [productRows] = await connection.execute(
        `SELECT *
         FROM products
         WHERE id = ? AND status = 1
         FOR UPDATE`,
        [item.productId]
      )
      const product = productRows[0]
      if (!product) {
        const error = new Error(`product ${item.productId} not found`)
        error.status = 404
        throw error
      }
      if (product.stock < quantity) {
        const error = new Error(`${product.name} stock is not enough`)
        error.status = 400
        throw error
      }
      const subtotal = money(Number(product.price) * quantity)
      goodsAmount = money(goodsAmount + subtotal)
      orderItems.push({
        productId: product.id,
        productName: product.name,
        productImage: product.image,
        price: Number(product.price),
        quantity,
        subtotal
      })
    }

    const deliveryMethod = data.deliveryMethod || 'door'
    const deliveryFee = deliveryMethod === 'pickup' ? 0 : 2
    let discountAmount = 0
    let couponId = null
    let userCouponId = data.userCouponId || null

    if (userCouponId) {
      const [couponRows] = await connection.execute(
        `SELECT uc.*, c.type, c.amount, c.threshold_amount, c.start_at, c.end_at, c.status AS coupon_status
         FROM user_coupons uc
         INNER JOIN coupons c ON c.id = uc.coupon_id
         WHERE uc.id = ? AND uc.user_id = ? AND uc.status = 'unused'
         FOR UPDATE`,
        [userCouponId, userId]
      )
      const userCoupon = couponRows[0]
      if (!userCoupon || userCoupon.coupon_status !== 1) {
        const error = new Error('user coupon is unavailable')
        error.status = 400
        throw error
      }
      if (userCoupon.start_at && new Date(userCoupon.start_at) > new Date()) {
        const error = new Error('coupon not started')
        error.status = 400
        throw error
      }
      if (userCoupon.end_at && new Date(userCoupon.end_at) < new Date()) {
        const error = new Error('coupon expired')
        error.status = 400
        throw error
      }
      discountAmount = calcCouponDiscount(userCoupon, goodsAmount, deliveryFee)
      if (discountAmount <= 0) {
        const error = new Error('coupon threshold not met')
        error.status = 400
        throw error
      }
      couponId = userCoupon.coupon_id
    }

    const payAmount = money(Math.max(goodsAmount + deliveryFee - discountAmount, 0))
    const [orderResult] = await connection.execute(
      `INSERT INTO orders
         (order_no, user_id, status, goods_amount, delivery_fee, discount_amount, pay_amount,
          coupon_id, user_coupon_id, building, room, phone, delivery_method, delivery_time, remark)
       VALUES (?, ?, 'pending', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        orderNo(),
        userId,
        goodsAmount,
        deliveryFee,
        discountAmount,
        payAmount,
        couponId,
        userCouponId,
        data.building,
        data.room,
        data.phone,
        deliveryMethod,
        data.deliveryTime || '',
        data.remark || ''
      ]
    )
    const orderId = orderResult.insertId

    for (const item of orderItems) {
      await connection.execute(
        `INSERT INTO order_items
           (order_id, product_id, product_name, product_image, price, quantity, subtotal)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          orderId,
          item.productId,
          item.productName,
          item.productImage,
          item.price,
          item.quantity,
          item.subtotal
        ]
      )
      await connection.execute(
        `UPDATE products
         SET stock = stock - ?,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [item.quantity, item.productId]
      )
    }

    if (userCouponId) {
      await connection.execute(
        `UPDATE user_coupons
         SET status = 'used',
             used_at = CURRENT_TIMESTAMP,
             order_id = ?
         WHERE id = ?`,
        [orderId, userCouponId]
      )
    }

    return orderId
  })
}

async function findByUserId(userId) {
  const rows = await db.query(
    `SELECT *
     FROM orders
     WHERE user_id = ?
     ORDER BY created_at DESC`,
    [userId]
  )
  return rows.map(mapOrder)
}

async function findById(id) {
  const rows = await db.query(
    `SELECT *
     FROM orders
     WHERE id = ?
     LIMIT 1`,
    [id]
  )
  const order = mapOrder(rows[0])
  if (!order) return null

  const itemRows = await db.query(
    `SELECT *
     FROM order_items
     WHERE order_id = ?
     ORDER BY id ASC`,
    [id]
  )
  order.items = itemRows.map(mapOrderItem)
  return order
}

async function cancel(id, userId) {
  return db.transaction(async connection => {
    const [orderRows] = await connection.execute(
      `SELECT *
       FROM orders
       WHERE id = ? AND user_id = ?
       FOR UPDATE`,
      [id, userId]
    )
    const order = orderRows[0]
    if (!order) {
      const error = new Error('order not found')
      error.status = 404
      throw error
    }
    if (order.status === 'canceled') {
      const error = new Error('order already canceled')
      error.status = 400
      throw error
    }
    if (order.status === 'finished') {
      const error = new Error('finished order cannot be canceled')
      error.status = 400
      throw error
    }

    const [itemRows] = await connection.execute(
      `SELECT *
       FROM order_items
       WHERE order_id = ?`,
      [id]
    )

    for (const item of itemRows) {
      await connection.execute(
        `UPDATE products
         SET stock = stock + ?,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [item.quantity, item.product_id]
      )
    }

    if (order.user_coupon_id) {
      await connection.execute(
        `UPDATE user_coupons
         SET status = 'unused',
             used_at = NULL,
             order_id = NULL
         WHERE id = ?`,
        [order.user_coupon_id]
      )
    }

    await connection.execute(
      `UPDATE orders
       SET status = 'canceled',
           canceled_at = CURRENT_TIMESTAMP,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [id]
    )
    return true
  })
}

module.exports = {
  create,
  findByUserId,
  findById,
  cancel
}
