class AppError extends Error {
  constructor(message, status = 400, code = 1, data = null) {
    super(message)
    this.name = 'AppError'
    this.status = status
    this.code = code
    this.data = data
  }
}

module.exports = AppError
