function success(res, data = null, message = 'success') {
  return res.json({
    code: 0,
    message,
    data
  })
}

function fail(res, message = 'fail', code = 1, status = 400, data = null) {
  return res.status(status).json({
    code,
    message,
    data
  })
}

module.exports = {
  success,
  fail
}
