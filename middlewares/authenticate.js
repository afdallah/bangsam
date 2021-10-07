const jwt = require('jsonwebtoken')
const { error } = require('../helpers/handler')

module.exports = (req, res, next) => {
  if (!req.headers.authorization) return error(400, 'Wrong headers!')
  const [prefix, token] = req.headers.authorization.split(' ')

  if (!prefix) { return error(400, 'No bearer prefix found!') }
  if (!token) return error(400, 'Token is required')

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY)
    if (!decoded) return error(400, 'Token is invalid!')

    req.user = decoded
    return next()
  } catch (err) {
    error(400, err)
  }
}
