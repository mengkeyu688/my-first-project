const mysql = require('mysql2/promise')
const env = require('./env')

const pool = mysql.createPool({
  host: env.mysql.host,
  port: env.mysql.port,
  user: env.mysql.user,
  password: env.mysql.password,
  database: env.mysql.database,
  waitForConnections: true,
  connectionLimit: env.mysql.connectionLimit,
  queueLimit: 0,
  charset: 'utf8mb4',
  timezone: '+08:00',
  dateStrings: true
})

async function query(sql, params = []) {
  const [rows] = await pool.execute(sql, params)
  return rows
}

async function getConnection() {
  return pool.getConnection()
}

async function transaction(callback) {
  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()
    const result = await callback(connection)
    await connection.commit()
    return result
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    connection.release()
  }
}

module.exports = {
  pool,
  query,
  getConnection,
  transaction
}
