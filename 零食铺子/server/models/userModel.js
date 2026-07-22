const db = require('../config/db')

function mapUser(row) {
  if (!row) return null
  return {
    id: row.id,
    openid: row.openid,
    unionid: row.unionid,
    nickname: row.nickname,
    avatarUrl: row.avatar_url,
    phone: row.phone,
    points: row.points,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }
}

async function findById(id) {
  const rows = await db.query(
    `SELECT *
     FROM users
     WHERE id = ?
     LIMIT 1`,
    [id]
  )
  return mapUser(rows[0])
}

async function findByOpenid(openid) {
  const rows = await db.query(
    `SELECT *
     FROM users
     WHERE openid = ?
     LIMIT 1`,
    [openid]
  )
  return mapUser(rows[0])
}

async function upsertWechatUser(data) {
  const existing = await findByOpenid(data.openid)
  if (existing) {
    await db.query(
      `UPDATE users
       SET unionid = COALESCE(?, unionid),
           session_key = ?,
           nickname = COALESCE(?, nickname),
           avatar_url = COALESCE(?, avatar_url),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        data.unionid || null,
        data.sessionKey,
        data.nickname || null,
        data.avatarUrl || null,
        existing.id
      ]
    )
    return findById(existing.id)
  }

  const result = await db.query(
    `INSERT INTO users
       (openid, unionid, session_key, nickname, avatar_url, phone, points)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      data.openid,
      data.unionid || null,
      data.sessionKey,
      data.nickname || '',
      data.avatarUrl || '',
      data.phone || '',
      data.points || 0
    ]
  )
  return findById(result.insertId)
}

module.exports = {
  findById,
  findByOpenid,
  upsertWechatUser,
  mapUser
}
