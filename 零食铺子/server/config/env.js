require('dotenv').config()

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 3000),
  mysql: {
    host: process.env.MYSQL_HOST || '127.0.0.1',
    port: Number(process.env.MYSQL_PORT || 3306),
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'dorm_snack_mall',
    connectionLimit: Number(process.env.MYSQL_CONNECTION_LIMIT || 10)
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'please_change_this_secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  },
  wechat: {
    appid: process.env.WECHAT_APPID || '',
    secret: process.env.WECHAT_SECRET || ''
  }
}

module.exports = env
