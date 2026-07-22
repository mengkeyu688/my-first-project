const app = require('./app')
const env = require('./config/env')
const { pool } = require('./config/db')

const HOST = '0.0.0.0'
const PORT = Number(env.port || 3000)

const server = app.listen(PORT, HOST, () => {
  console.log(`server running at http://127.0.0.1:${PORT}`)
})

async function shutdown(signal) {
  console.log(`${signal} received, closing server...`)
  server.close(async () => {
    await pool.end()
    process.exit(0)
  })
}

process.on('SIGINT', () => shutdown('SIGINT'))
process.on('SIGTERM', () => shutdown('SIGTERM'))
