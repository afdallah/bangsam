const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const User = require('../models/user.js')
const Address = require('../models/address.js')
const Point = require('../models/point.js')
const messageSender = require('../helpers/messageSender')

const {
  error,
  success
} = require('../helpers/handler.js')

const register = async (req, res, next) => {
  const {
    first_name,
    last_name,
    email,
    phone_number,
    password,
    password_confirmation,
    address,
    account_number
  } = req.body

  try {
    if (password !== password_confirmation) return error(422, 'Your password and its confimation is not match')
    const password_digest = bcrypt.hashSync(password, bcrypt.genSaltSync(10))
    const users = await User.find()
    const isExist = await User.findOne({ phone_number })

    if (isExist) return error(400, 'User with phone number is exist, use another phone number')

    let msg = null
    if (process.env.NODE_ENV !== 'test') {
      msg = await messageSender.verify({
        number: phone_number,
        brand: 'Bangsam GA5',
        code_length: '4'
      })

      if (msg.error_text) {
        return error(400, msg.error_text)
      }
    }

    let user = await User.create({
      first_name,
      last_name,
      email,
      phone_number,
      password_digest,
      address,
      account_number,
      request_id: msg ? msg.request_id : '',
      role: users.length > 0 ? 'nasabah' : 'admin'
    })

    user = user.toObject()
    const token = jwt.sign(
      { _id: user._id, role: users.length < 1 ? 'admin' : 'nasabah', is_verified: false },
      process.env.JWT_SECRET_KEY
    )

    delete user.password_digest
    user.token = token
    success(res, 201, user)
  } catch (err) {
    next(err)
  }
}

const login = (req, res, next) => {
  User.findOne({ $or: [{ email: req.body.email }, { phone_number: req.body.phone_number }] })
    .populate('addresses')
    .then((data) => {
      if (!data) return error(404, 'Your phone number or email is not registered. Register now!')
      if (bcrypt.compareSync(req.body.password, data.password_digest)) {
        delete data._doc.password_digest
        // if (!req.is_verified) return error(400, 'You must verify your phone number. Check your inbox!')

        const token = jwt.sign({ _id: data._id, role: data.role }, process.env.JWT_SECRET_KEY)
        return success(res, 200, { ...data._doc, token })
      } else {
        return error(422, 'Wrong Password', false)
      }
    })
    .catch((err) => {
      next(err)
    })
}

const current = async (req, res, next) => {
  try {
    let user = await User
      .findOne({ _id: req.user._id })
      .select('-password_digest').populate('addresses')

    const pts = await Point.findOne({ user: req.user._id })

    user = user.toObject()
    user.point = pts
    success(res, 200, user)
  } catch (err) {
    next(err)
  }
}

const show = async (req, res, next) => {
  const { query: string = '', page = 1, limit = 15 } = req.query
  const regex = { $regex: string, $options: 'i' }
  // Able to query using first_name or last_name field
  const query = { $or: [{ first_name: regex }, { last_name: regex }] }

  try {
    const users = await User
      .paginate(query, { limit, page, select: '-password_digest', populate: 'addresses' })

    success(res, 200, users)
  } catch (err) {
    next(err)
  }
}

const update = (req, res, next) => {
  delete req.body.email
  delete req.body.role
  delete req.body.password_digest
  delete req.body.password
  delete req.body.phone_number
  delete req.body.balance

  User.findOneAndUpdate(
    { _id: req.user._id },
    { $set: { ...req.body } },
    { new: true }).select('-password_digest')
    .then((data) => {
      success(res, 200, data)
    })
    .catch((err) => {
      next(err)
    })
}

// Update user address
const updateUserAddress = async (req, res, next) => {
  const { address_id } = req.params

  try {
    if (!req.user) return error(401, 'You need to login to do this action!')
    const address = await Address.findByIdAndUpdate(
      address_id,
      { $set: { ...req.body } },
      { new: true }
    )

    success(res, 200, address)
  } catch (err) {
    next(err)
  }
}

const updatePassword = async (req, res, next) => {
  const id = req.user._id
  const { old_password, password, password_confirmation } = req.body

  try {
    const user = await User.findById(id)
    const compare = bcrypt.compareSync(old_password, user.password_digest)
    if (!compare) return error(422, 'Input your old password correctly')
    if (password !== password_confirmation) return error(422, 'Your password and its confimation is not match')

    const password_digest = bcrypt.hashSync(password, 10)
    await User.findOneAndUpdate({ _id: id }, { $set: { password_digest } })
    success(res, 200, 'Successfully change password')
  } catch (err) {
    next(err)
  }
}

const verify = async (req, res, next) => {
  const { request_id, code } = req.query
  const { user_id } = req.params

  try {
    const msg = await messageSender.check({
      request_id,
      code
    })

    if (msg.error_text) return error(400, msg.error_text)

    let user = await User.findByIdAndUpdate(
      user_id,
      { is_verified: true, request_id: undefined },
      { new: true }
    ).select('-password_digest')

    const token = jwt.sign(
      { _id: user._id, role: user.role, is_verified: true },
      process.env.JWT_SECRET_KEY
    )

    user = user.toObject()
    delete user.password_digest
    user.token = token

    success(res, 200, user)
  } catch (err) {
    next(err)
  }
}

module.exports = {
  register,
  login,
  update,
  show,
  current,
  verify,
  updateUserAddress,
  updatePassword
}
