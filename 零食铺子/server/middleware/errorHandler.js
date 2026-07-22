const AppError = require('../utils/errors')
const { fail } = require('../utils/response')

function notFound(req, res) {
  return fail(res, 'api not found', 404, 404)
}

function errorHandler(error, req, res, next) {
  if (error instanceof AppError) {
    return fail(res, error.message, error.code, error.status, error.data)
  }
  if (error.status) {
    return fail(res, error.message || 'request error', error.status, error.status)
  }
  if (error.code === 'ER_DUP_ENTRY') {
    return fail(res, 'duplicate data', 409, 409)
  }

  console.error(error)
  return fail(res, 'server error', 500, 500)
}

module.exports = {
  notFound,
  errorHandler
}
