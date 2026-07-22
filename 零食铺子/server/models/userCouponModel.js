const db = require('../config/db')

function mapUserCoupon(row) {
  if (!row) return null
  return {
    id: row.id,
    userId: row.user_id,
    couponId: row.coupon_id,
    status: row.status,
    receivedAt: row.received_at,
    usedAt: row.used_at,
    orderId: row.order_id,
    coupon: {
      id: row.coupon_id,
      name: row.coupon_name,
      type: row.coupon_type,
      amount: Number(row.amount),
      thresholdAmount: Number(row.threshold_amount),
      startAt: row.start_at,
      endAt: row.end_at
    }
  }
}

async function findByUserId(userId) {
  const rows = await db.query(
    `SELECT uc.*,
            c.name AS coupon_name,
            c.type AS coupon_type,
            c.amount,
            c.threshold_amount,
            c.start_at,
            c.end_at
     FROM user_coupons uc
     INNER JOIN coupons c ON c.id = uc.coupon_id
     WHERE uc.user_id = ?
     ORDER BY uc.received_at DESC`,
    [userId]
  )
  return rows.map(mapUserCoupon)
}

async function receive(userId, couponId) {
  return db.transaction(async connection => {
    const [couponRows] = await connection.execute(
      `SELECT *
       FROM coupons
       WHERE id = ? AND status = 1
       FOR UPDATE`,
      [couponId]
    )
    const coupon = couponRows[0]
    if (!coupon) {
      const error = new Error('coupon not found')
      error.status = 404
      throw error
    }
    if (coupon.remaining_stock <= 0) {
      const error = new Error('coupon stock is empty')
      error.status = 400
      throw error
    }
    if (coupon.start_at && new Date(coupon.start_at) > new Date()) {
      const error = new Error('coupon not started')
      error.status = 400
      throw error
    }
    if (coupon.end_at && new Date(coupon.end_at) < new Date()) {
      const error = new Error('coupon expired')
      error.status = 400
      throw error
    }

    const [result] = await connection.execute(
      `INSERT INTO user_coupons (user_id, coupon_id, status)
       VALUES (?, ?, 'unused')`,
      [userId, couponId]
    )
    await connection.execute(
      `UPDATE coupons
       SET remaining_stock = remaining_stock - 1,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [couponId]
    )
    return result.insertId
  })
}

module.exports = {
  findByUserId,
  receive,
  mapUserCoupon
}
