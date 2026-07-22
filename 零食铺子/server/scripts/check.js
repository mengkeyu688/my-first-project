const http = require('http')
const env = require('../config/env')
const db = require('../config/db')

function checkApi() {
  return new Promise(resolve => {
    const req = http.get(`http://127.0.0.1:${env.port}/api/health`, res => {
      let body = ''
      res.on('data', chunk => {
        body += chunk
      })
      res.on('end', () => {
        resolve({
          ok: res.statusCode === 200,
          statusCode: res.statusCode,
          body
        })
      })
    })

    req.setTimeout(3000, () => {
      req.destroy()
      resolve({ ok: false, error: 'api timeout' })
    })

    req.on('error', error => {
      resolve({ ok: false, error: error.message })
    })
  })
}

async function main() {
  const categoryRows = await db.query('SELECT COUNT(*) AS count FROM categories')
  const productRows = await db.query('SELECT COUNT(*) AS count FROM products')
  const onSaleRows = await db.query('SELECT COUNT(*) AS count FROM products WHERE status = 1')
  const api = await checkApi()

  console.log(`MySQL: OK`)
  console.log(`Categories: ${categoryRows[0].count}`)
  console.log(`Products: ${productRows[0].count}`)
  console.log(`On-sale products: ${onSaleRows[0].count}`)
  console.log(`API: ${api.ok ? 'OK' : `NOT RUNNING (${api.error || api.statusCode})`}`)

  if (!Number(productRows[0].count)) {
    process.exitCode = 1
  }
  if (!api.ok) {
    process.exitCode = 1
  }
}

main()
  .catch(error => {
    console.error(error.message)
    process.exitCode = 1
  })
  .finally(async () => {
    await db.pool.end()
  })
