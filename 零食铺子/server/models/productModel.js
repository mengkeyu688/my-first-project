const db = require('../config/db')

function toNumber(value, fallback = 0) {
  if (value === undefined || value === null || value === '') return fallback
  return Number(value)
}

function generatedImage() {
  const index = Math.floor(Math.random() * 12) + 1
  return `/images/goods-${index}.png`
}

function mapProduct(row) {
  if (!row) return null
  const image = row.image || ''
  return {
    id: row.id,
    name: row.name,
    categoryId: row.category_id,
    categoryName: row.category_name,
    category: row.category_name,
    price: Number(row.price),
    originalPrice: Number(row.original_price),
    stock: row.stock,
    sales_count: Number(row.sales_count || 0),
    image,
    imageUrl: image,
    description: row.description,
    desc: row.description,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }
}

async function findAll(filters = {}) {
  const page = Math.max(Number(filters.page || 1), 1)
  const pageSize = Math.min(Math.max(Number(filters.pageSize || 20), 1), 100)
  const offset = (page - 1) * pageSize
  const where = []
  const params = []

  if (filters.keyword) {
    where.push('(p.name LIKE ? OR p.description LIKE ?)')
    params.push(`%${filters.keyword}%`, `%${filters.keyword}%`)
  }
  if (filters.categoryId) {
    where.push('p.category_id = ?')
    params.push(filters.categoryId)
  }
  if (filters.categoryName) {
    where.push('c.name = ?')
    params.push(filters.categoryName)
  }
  if (filters.status !== undefined && filters.status !== '') {
    where.push('p.status = ?')
    params.push(Number(filters.status))
  }

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : ''
  const countRows = await db.query(
    `SELECT COUNT(*) AS total
     FROM products p
     LEFT JOIN categories c ON c.id = p.category_id
     ${whereSql}`,
    params
  )
  const rows = await db.query(
    `SELECT p.*, c.name AS category_name
     FROM products p
     LEFT JOIN categories c ON c.id = p.category_id
     ${whereSql}
     ORDER BY p.status DESC, p.sales_count DESC, p.id ASC
     LIMIT ? OFFSET ?`,
    [...params, pageSize, offset]
  )

  return {
    list: rows.map(mapProduct),
    pagination: {
      page,
      pageSize,
      total: countRows[0].total
    }
  }
}

async function findById(id) {
  const rows = await db.query(
    `SELECT p.*, c.name AS category_name
     FROM products p
     LEFT JOIN categories c ON c.id = p.category_id
     WHERE p.id = ?
     LIMIT 1`,
    [id]
  )
  return mapProduct(rows[0])
}

function normalizePayload(data) {
  return {
    categoryId: data.categoryId || data.category_id,
    name: data.name,
    price: toNumber(data.price),
    originalPrice: toNumber(data.originalPrice || data.original_price || data.price),
    stock: toNumber(data.stock),
    sales_count: toNumber(data.sales_count || data.salesCount),
    image: data.image || data.imageUrl || data.image_url || generatedImage(),
    description: data.description || data.desc || '',
    status: data.status === undefined || data.status === '' ? 1 : Number(data.status)
  }
}

async function create(data) {
  const product = normalizePayload(data)
  const result = await db.query(
    `INSERT INTO products
       (name, category_id, price, original_price, stock, sales_count, image, description, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      product.name,
      product.categoryId,
      product.price,
      product.originalPrice,
      product.stock,
      product.sales_count,
      product.image,
      product.description,
      product.status
    ]
  )
  return findById(result.insertId)
}

async function update(id, data) {
  const fields = []
  const params = []
  const fieldMap = {
    categoryId: 'category_id',
    category_id: 'category_id',
    name: 'name',
    price: 'price',
    originalPrice: 'original_price',
    original_price: 'original_price',
    stock: 'stock',
    sales_count: 'sales_count',
    salesCount: 'sales_count',
    image: 'image',
    imageUrl: 'image',
    image_url: 'image',
    description: 'description',
    desc: 'description',
    status: 'status'
  }
  const usedColumns = new Set()

  Object.keys(fieldMap).forEach(key => {
    if (data[key] !== undefined) {
      const column = fieldMap[key]
      if (usedColumns.has(column)) return
      usedColumns.add(column)
      fields.push(`${column} = ?`)
      params.push(data[key])
    }
  })

  if (!fields.length) return findById(id)

  fields.push('updated_at = CURRENT_TIMESTAMP')
  params.push(id)
  await db.query(`UPDATE products SET ${fields.join(', ')} WHERE id = ?`, params)
  return findById(id)
}

async function remove(id) {
  const result = await db.query('DELETE FROM products WHERE id = ?', [id])
  return result.affectedRows > 0
}

module.exports = {
  findAll,
  findById,
  create,
  update,
  remove,
  mapProduct
}
