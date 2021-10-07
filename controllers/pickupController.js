const { success, error } = require('../helpers/handler')
const Pickup = require('../models/pickup.js')
const User = require('../models/user')
const Address = require('../models/address')
const Balance = require('../models/balance')
const Point = require('../models/point')

const sendRequest = async (req, res, next) => {
  const { item_details, amount } = req.body
  const { branch_id } = req.params

  try {
    // Save user address to address collection
    // and then push the saved address to the User
    const user_id = req.user._id
    const address = await Address.create({ user_id, ...req.body.address })
    const user = await User.findById(user_id)
    user.addresses.push(address._id)
    await user.save()

    // Create new pickup request
    const request = await Pickup.create({
      user: user_id,
      branch: branch_id,
      amount,
      item_details,
      address,
      transaction_id: 'BA' + Date.now()
    })
    success(res, 201, request)
  } catch (err) {
    next(err)
  }
}

const getSingleRequest = async (req, res, next) => {
  try {
    const { request_id } = req.params
    const request = await Pickup
      .findById(request_id)
      .populate('address')
      .populate({
        path: 'user',
        select: ['first_name', 'last_name', 'email', 'phone_number']
      })
      .populate({
        path: 'branch',
        select: ['branch_name', 'phone_number', 'address', 'image']
      })

    success(res, 200, request)
  } catch (err) {
    next(err)
  }
}

const getAllRequest = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') return error(400, 'Only admin allowed to see all the pick up records')

    const requests = await Pickup
      .find()
      .populate({
        path: 'user',
        select: ['first_name', 'phone_number']
      })
      .populate({
        path: 'branch',
        select: ['phone_number', 'branch_name', 'address']
      }).populate({
        path: 'address'
      })
    success(res, 200, requests)
  } catch (err) {
    next(err)
  }
}

const getUsersRequests = async (req, res, next) => {
  try {
    if (!req.user._id) return error(400, 'You need to login to do this action')
    let query = req.user.role === 'nasabah' ? { user: req.user._id } : { branch: req.user._id }

    if (req.user.role === 'admin') {
      query = {}
    }

    const requests = await Pickup
      .find(query)
      .populate({
        path: 'user',
        select: ['first_name', 'phone_number']
      })
      .populate({
        path: 'branch',
        select: ['phone_number', 'branch_name', 'address', 'image']
      }).populate({
        path: 'address'
      })
    success(res, 200, requests)
  } catch (err) {
    next(err)
  }
}

const getCurrent = async (req, res, next) => {
  const id = req.user._id

  try {
    const pickRequest = await Pickup.find({ user: id }).select('-password_digest')
    success(res, 200, pickRequest)
  } catch (err) {
    next(err)
  }
}

const showRequest = async (req, res, next) => {
  try {
    const pickRequest = await Pickup.find({ bank_sampah: req.params.bank_sampah })
    success(res, 200, pickRequest)
  } catch (err) {
    next(err)
  }
}

const approveRequest = async (req, res, next) => {
  const { estimated_time } = req.body

  try {
    if (!req.user._id) return error(400, 'You should login to perform this action')
    const pickRequest = await Pickup
      .findOneAndUpdate(
        { _id: req.params.request_id, branch: req.user._id },
        { $set: { estimated_time } },
        { new: true }
      )
    success(res, 200, pickRequest)
  } catch (err) {
    next(err)
  }
}

const disapproveRequest = async (req, res, next) => {
  const { reason } = req.body

  try {
    if (!req.user._id) return error(400, 'You should login to perform this action')
    const pickRequest = await Pickup
      .findOneAndUpdate(
        { _id: req.params.request_id, branch: req.user._id },
        { $set: { reason, is_completed: true } },
        { new: true }
      )
    success(res, 200, pickRequest)
  } catch (err) {
    next(err)
  }
}

const updateRequest = async (req, res, next) => {
  const branch_id = req.user._id
  const { item_details, amount } = req.body

  try {
    delete req.body.user
    delete req.body.branch
    if (!req.user._id) return error(400, 'You should login to do this action')
    const pickup = await Pickup
      .findOneAndUpdate(
        { _id: req.params.request_id, branch: branch_id },
        { $set: { item_details, amount, is_completed: true } },
        { new: true }
      )

    const total = await Pickup.find({ user: pickup.user, is_completed: true, reason: '' }).countDocuments()

    if ((total % 3 === 0)) {
      let pts = await Point.findOneAndUpdate(
        { user: pickup.user },
        { $inc: { point: 100 } }, { new: true }
      )

      if (!pts) {
        pts = await Point.create({
          point: 100,
          user: pickup.user,
          transaction: pickup._id
        })
      }

      pickup.point = pts.point
      await pickup.save()
    }

    const balance = await Balance.findOne({ user: pickup.user, branch: branch_id })
    if (balance === null) {
      await Balance.create({
        branch: branch_id,
        user: pickup.user,
        transaction: req.params.request_id,
        total: pickup.amount
      })
    } else {
      await Balance.findOneAndUpdate(
        { user: pickup.user, branch: branch_id },
        { $set: { transaction: req.params.request_id, total: balance.total + amount } }
      )
    }

    success(res, 200, pickup)
  } catch (err) {
    next(err)
  }
}

module.exports = {
  sendRequest,
  getCurrent,
  showRequest,
  getSingleRequest,
  getAllRequest,
  updateRequest,
  approveRequest,
  disapproveRequest,
  getUsersRequests
}
