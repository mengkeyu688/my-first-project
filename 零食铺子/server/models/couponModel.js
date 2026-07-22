const db = require('../config/db')

function mapCoupon(row) {
  if (!row) return null
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    amount: Number(row.amount),
    thresholdAmount: Number(row.threshold_amount),
    totalStock: row.total_stock,
    remainingStock: row.remaining_stock,
    startAt: row.start_at,
    endAt: row.end_at,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }
}

async function findAll() {
  const rows = await db.query(
    `SELECT *
     FROM coupons
     ORDER BY created_at DESC`
  )
  return rows.map(mapCoupon)
}

async function findById(id) {
  const rows = await db.query(
    `SELECT *
     FROM coupons
     WHERE id = ?
     LIMIT 1`,
    [id]
  )
  return mapCoupon(rows[0])
}

async function create(data) {
  const totalStock = Number(data.totalStock || data.remainingStock || 0)
  const result = await db.query(
    `INSERT INTO coupons
       (name, type, amount, threshold_amount, total_stock, remaining_stock, start_at, end_at, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.name,
      data.type,
      data.amount,
      data.thresholdAmount || 0,
      totalStock,
      data.remainingStock === undefined ? totalStock : Number(data.remainingStock),
      data.startAt || null,
      data.endAt || null,
      data.status === undefined ? 1 : Number(data.status)
    ]
  )
  return findById(result.insertId)
}

async function update(id, data) {
  const fields = []
  const params = []
  const fieldMap = {
    name: 'name',
    type: 'type',
    amount: 'amount',
    thresholdAmount: 'threshold_amount',
    totalStock: 'total_stock',
    remainingStock: 'remaining_stock',
    startAt: 'start_at',
    endAt: 'end_at',
    status: 'status'
  }

  Object.keys(fieldMap).forEach(key => {
    if (data[key] !== undefined) {
      fields.push(`${fieldMap[key]} = ?`)
      params.push(data[key])
    }
  })

  if (!fields.length) return findById(id)

  fields.push('updated_at = CURRENT_TIMESTAMP')
  params.push(id)
  await db.query(`UPDATE coupons SET ${fields.join(', ')} WHERE id = ?`, params)
  return findById(id)
}

async function remove(id) {
  const result = await db.query('DELETE FROM coupons WHERE id = ?', [id])
  return result.affectedRows > 0
}

module.exports = {
  findAll,
  findById,
  create,
  update,
  remove,
  mapCoupon
}
