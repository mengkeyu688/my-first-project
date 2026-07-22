const db = require('../config/db')

function mapCategory(row) {
  if (!row) return null
  return {
    id: row.id,
    name: row.name,
    iconUrl: row.icon_url,
    sortOrder: row.sort_order,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }
}

async function findAll() {
  const rows = await db.query(
    `SELECT *
     FROM categories
     WHERE status = 1
     ORDER BY sort_order ASC, id ASC`
  )
  return rows.map(mapCategory)
}

module.exports = {
  findAll,
  mapCategory
}
