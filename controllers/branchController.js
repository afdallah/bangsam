const ImageKit = require('imagekit')

const { success, error } = require('../helpers/handler')
const Branch = require('../models/branch')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const messageSender = require('../helpers/messageSender')

const imagekit = new ImageKit({
  publicKey: 'public_elvDtzqvVzQ2QGS+pPCXL3/3pYs=',
  privateKey: 'private_M262WSmVFcKqMtqakhc1jIRTzsg=',
  urlEndpoint: 'https://ik.imagekit.io/dallah/'
})

exports.register = async (req, res, next) => {
  const { branch_name, phone_number, password, password_confirmation, address } = req.body

  try {
    if (password !== password_confirmation) return error(422, 'Your password and its confimation is not match')

    // Hash the password
    const password_digest = bcrypt.hashSync(password, bcrypt.genSaltSync(10))
    const isExist = await Branch.findOne({ phone_number })

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

    let branch = await Branch.create({
      branch_name,
      phone_number,
      password_digest,
      address,
      request_id: msg ? msg.request_id : ''
    })

    branch = branch.toObject()
    const token = jwt.sign({ _id: branch._id, is_verified: false }, process.env.JWT_SECRET_KEY, { expiresIn: '7d' })
    delete branch.password_digest
    branch.token = token
    success(res, 201, branch)
  } catch (err) {
    next(err)
  }
}

exports.login = async (req, res, next) => {
  const { phone_number, password } = req.body

  try {
    if (!phone_number) return error(422, 'Phone number is required')
    if (!password) return error(422, 'Password is required')

    let branch = await Branch.findOne({ phone_number })

    if (!branch) return success(res, 404, 'Your phone number is not registered. Register now!')
    const isValidPassword = bcrypt.compareSync(password, branch.password_digest)
    if (!isValidPassword) return error(422, 'You phone number or password is incorrect')

    const token = jwt.sign({ _id: branch._id }, process.env.JWT_SECRET_KEY, { expiresIn: '7d' })

    branch = branch.toObject()
    branch.token = token

    delete branch.password_digest
    success(res, 200, branch)
  } catch (err) {
    next(err)
  }
}

exports.getCurrent = async (req, res, next) => {
  const id = req.user._id

  try {
    const branch = await Branch.findById(id).select('-password_digest')
    success(res, 200, branch)
  } catch (err) {
    next(err)
  }
}

exports.uploadImage = async (req, res, next) => {
  try {
    const uploaded = await imagekit.upload({
      file: req.file.buffer.toString('base64'),
      fileName: `${req.file.fieldname}-${
        req.file.originalname.split('.')[0]
      }-${Date.now()}.${req.file.mimetype.split('/')[1]}`
    })

    const branch = await Branch
      .findOneAndUpdate({ _id: req.user._id }, { $set: { image: uploaded.url } }, { new: true })
      .select('-password_digest')

    success(res, 200, branch)
  } catch (err) {
    next(err)
  }
}

// Get all branches
// Query/search branch (optional)
exports.getAllBranches = async (req, res, next) => {
  const { query: string = '', page = 1, limit = 15 } = req.query
  const query = { branch_name: { $regex: string, $options: 'i' } }

  try {
    const branches = await Branch.paginate(query, { limit, page, select: '-password_digest' })

    success(res, 200, branches)
  } catch (err) {
    next(err)
  }
}

// Close the branch
exports.closeTheBranch = async (req, res, next) => {
  const { branch_id } = req.params

  try {
    if (req.user.role !== 'admin') return error(401, 'You are not authorized to do this action')

    const closed = await Branch
      .findByIdAndUpdate(
        branch_id,
        { $set: { blocked: true } },
        { new: true }
      )
      .select('-password_digest')

    success(res, 200, closed)
  } catch (err) {
    next(err)
  }
}

exports.update = async (req, res, next) => {
  const id = req.user._id

  try {
    delete req.body.phone_number
    delete req.body.blocked
    delete req.body.balance
    delete req.body.password
    delete req.body.password_digest
    const update = await Branch
      .findByIdAndUpdate(id, { $set: { ...req.body } }, { new: true })
      .select('-password_digest')
    success(res, 200, update)
  } catch (err) {
    next(err)
  }
}

exports.updatePassword = async (req, res, next) => {
  const id = req.user._id
  const { old_password, password, password_confirmation } = req.body

  try {
    const user = await Branch.findById(id)
    const compare = bcrypt.compareSync(old_password, user.password_digest)
    if (!compare) return error(422, 'Input your old password correctly')
    if (password !== password_confirmation) return error(422, 'Your password and its confimation is not match')

    const password_digest = bcrypt.hashSync(password, 10)
    await Branch.findOneAndUpdate({ _id: id }, { $set: { password_digest } })
    success(res, 200, 'Successfully change password')
  } catch (err) {
    next(err)
  }
}

exports.verify = async (req, res, next) => {
  const { request_id, code } = req.query
  const { branch_id } = req.params

  try {
    const msg = await messageSender.check({
      request_id,
      code
    })

    if (msg.error_text) return error(400, msg.error_text)

    let branch = await Branch.findByIdAndUpdate(
      branch_id,
      { is_verified: true, request_id: undefined },
      { new: true }
    ).select('-password_digest')

    const token = jwt.sign(
      { _id: branch._id, role: branch.role, is_verified: true },
      process.env.JWT_SECRET_KEY
    )

    branch = branch.toObject()
    delete branch.password_digest
    branch.token = token

    success(res, 200, branch)
  } catch (err) {
    next(err)
  }
}
