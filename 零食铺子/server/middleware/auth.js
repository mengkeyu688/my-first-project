const { fail } = require('../utils/response')
const { verifyToken } = require('../utils/jwt')

function auth(req, res, next) {
  const header = req.headers.authorization || ''
  const parts = header.split(' ')
  if (parts.length !== 2 || parts[0] !== 'Bearer' || !parts[1]) {
    return fail(res, 'missing authorization token', 401, 401)
  }

  try {
    req.user = verifyToken(parts[1])
    return next()
  } catch (error) {
    return fail(res, 'invalid or expired token', 401, 401)
  }
}

module.exports = auth
