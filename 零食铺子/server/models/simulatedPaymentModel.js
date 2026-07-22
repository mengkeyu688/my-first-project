const db = require('../config/db')

function parseJson(value, fallback) {
  if (!value) return fallback
  if (typeof value !== 'string') return value
  try {
    return JSON.parse(value)
  } catch (error) {
    return fallback
  }
}

function money(value) {
  return Number(Number(value || 0).toFixed(2))
}

function fenToYuan(value) {
  return money(Number(value || 0) / 100)
}

function createOrderNo() {
  const date = new Date()
  const pad = value => String(value).padStart(2, '0')
  const stamp = [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
    pad(date.getHours()),
    pad(date.getMinutes()),
    pad(date.getSeconds())
  ].join('')
  const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0')
  return `MO${stamp}${random}`
}

function normalizeItem(item) {
  const quantity = Math.max(Number(item.quantity || item.qty || 1), 1)
  const priceFee = Math.max(Number(item.priceFee || item.price_fee || Math.round(Number(item.price || 0) * 100)), 0)
  const subtotalFee = Math.max(Number(item.subtotalFee || item.subtotal_fee || priceFee * quantity), 0)
  return {
    productId: item.productId || item.product_id || item.id || null,
    name: item.name || item.productName || '',
    image: item.image || item.productImage || '',
    priceFee,
    price: fenToYuan(priceFee),
    quantity,
    subtotalFee,
    subtotal: fenToYuan(subtotalFee)
  }
}

function mapOrder(row) {
  if (!row) return null
  const totalFee = Number(row.total_fee || Math.round(Number(row.pay_amount || 0) * 100))
  return {
    id: row.id,
    orderNo: row.order_no,
    userId: row.user_id,
    items: parseJson(row.items, []),
    totalFee,
    totalAmount: fenToYuan(totalFee),
    status: row.status,
    createdAt: row.created_at,
    paidAt: row.paid_at,
    receiverName: row.receiver_name,
    receiverPhone: row.receiver_phone || row.phone,
    receiverBuilding: row.receiver_building || row.building,
    receiverRoom: row.receiver_room || row.room,
    deliveryMethod: row.delivery_method,
    deliveryTime: row.delivery_time,
    remark: row.remark
  }
}

async function findByOrderNo(orderNo) {
  const rows = await db.query(
    `SELECT *
     FROM orders
     WHERE order_no = ?
     LIMIT 1`,
    [orderNo]
  )
  const order = mapOrder(rows[0])
  if (!order) return null

  if (!order.items.length) {
    const itemRows = await db.query(
      `SELECT product_id, product_name, product_image, price, quantity, subtotal
       FROM order_items
       WHERE order_id = ?
       ORDER BY id ASC`,
      [order.id]
    )
    order.items = itemRows.map(item => ({
      productId: item.product_id,
      name: item.product_name,
      image: item.product_image,
      price: Number(item.price),
      priceFee: Math.round(Number(item.price) * 100),
      quantity: item.quantity,
      subtotal: Number(item.subtotal),
      subtotalFee: Math.round(Number(item.subtotal) * 100)
    }))
  }

  return order
}

async function create(data) {
  return db.transaction(async connection => {
    const items = (data.items || []).map(normalizeItem)
    const totalFee = Math.max(Number(data.totalFee || data.total_fee || items.reduce((sum, item) => sum + item.subtotalFee, 0)), 0)
    const payAmount = fenToYuan(totalFee)
    const orderNo = createOrderNo()
    const userId = Number(data.userId || data.user_id)

    const [userRows] = await connection.execute(
      'SELECT id FROM users WHERE id = ? LIMIT 1',
      [userId]
    )
    if (!userRows.length) {
      const error = new Error('user not found')
      error.status = 400
      throw error
    }

    const [orderResult] = await connection.execute(
      `INSERT INTO orders
         (order_no, user_id, items, total_fee, status, goods_amount, delivery_fee, discount_amount, pay_amount,
          receiver_name, receiver_phone, receiver_building, receiver_room,
          building, room, phone, delivery_method, delivery_time, remark)
       VALUES (?, ?, ?, ?, 'unpaid', ?, 0, 0, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        orderNo,
        userId,
        JSON.stringify(items),
        totalFee,
        payAmount,
        payAmount,
        data.receiverName || data.name || '',
        data.receiverPhone || data.phone || '',
        data.receiverBuilding || data.building || '',
        data.receiverRoom || data.room || '',
        data.building || data.receiverBuilding || '',
        data.room || data.receiverRoom || '',
        data.phone || data.receiverPhone || '',
        data.deliveryMethod || 'door',
        data.deliveryTime || '',
        data.remark || ''
      ]
    )

    const orderId = orderResult.insertId
    for (const item of items) {
      await connection.execute(
        `INSERT INTO order_items
           (order_id, product_id, product_name, product_image, price, quantity, subtotal)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          orderId,
          item.productId,
          item.name,
          item.image,
          item.price,
          item.quantity,
          item.subtotal
        ]
      )
    }

    return orderNo
  })
}

async function markPaid(orderNo) {
  return db.transaction(async connection => {
    const [rows] = await connection.execute(
      `SELECT *
       FROM orders
       WHERE order_no = ?
       FOR UPDATE`,
      [orderNo]
    )
    const order = rows[0]
    if (!order) {
      const error = new Error('order not found')
      error.status = 404
      throw error
    }
    if (order.status === 'paid') {
      return {
        orderNo,
        status: 'paid',
        repeated: true
      }
    }
    if (order.status !== 'unpaid') {
      const error = new Error(`order status is ${order.status}, cannot pay`)
      error.status = 400
      throw error
    }

    await connection.execute(
      `UPDATE orders
       SET status = 'paid',
           paid_at = CURRENT_TIMESTAMP,
           updated_at = CURRENT_TIMESTAMP
       WHERE order_no = ? AND status = 'unpaid'`,
      [orderNo]
    )

    const [items] = await connection.execute(
      `SELECT product_id, quantity
       FROM order_items
       WHERE order_id = ? AND product_id IS NOT NULL`,
      [order.id]
    )

    for (const item of items) {
      await connection.execute(
        `UPDATE products
         SET sales_count = sales_count + ?,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [Number(item.quantity || 0), item.product_id]
      )
    }

    return {
      orderNo,
      status: 'paid',
      repeated: false
    }
  })
}

async function cancel(orderNo) {
  const result = await db.query(
    `UPDATE orders
     SET status = 'cancelled',
         canceled_at = CURRENT_TIMESTAMP,
         updated_at = CURRENT_TIMESTAMP
     WHERE order_no = ? AND status = 'unpaid'`,
    [orderNo]
  )
  return result.affectedRows > 0
}

module.exports = {
  create,
  findByOrderNo,
  markPaid,
  cancel
}
