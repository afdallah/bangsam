class CreateError extends Error {
  constructor (statusCode, message, status) {
    super()
    this.statusCode = statusCode
    this.message = message
    this.status = status
  }
}

const error = (statusCode, message, status) => {
  throw new CreateError(statusCode, message, status)
}

const success = (res, statusCode, data, status = true) => {
  res.status(statusCode).json({
    status,
    data
  })
}

module.exports = {
  CreateError,
  error,
  success
}
