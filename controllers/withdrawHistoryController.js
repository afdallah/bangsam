const { success, error } = require('../helpers/handler')
const withdrawHistory = require('../models/withdrawHistory')
const Balance = require('../models/balance')

exports.approveRequest = async (req, res, next) => {
  const branch = req.user._id
  try {
    if (!req.user._id) return error(400, 'You should login to perform this action')
    const approve = await withdrawHistory.findOneAndUpdate(
      { _id: req.params.withdrawHistory_id, branch },
      { $set: { is_completed: true } },
      { new: true }
    )

    const balance = await Balance.findOne({ user: approve.user, branch })
    await Balance
      .findOneAndUpdate({ user: approve.user, branch }, { $set: { total: balance.total - approve.amount } }, { new: true })
    success(res, 200, approve)
  } catch (err) {
    next(err)
  }
}

exports.disapproveRequest = async (req, res, next) => {
  const { reason } = req.body
  try {
    if (!req.user._id) return error(400, 'You should login to perform this action')
    const disapprove = await withdrawHistory
      .findByIdAndUpdate(
        { _id: req.params.withdrawHistory_id, branch: req.user._id },
        { $set: { reason, is_completed: true } },
        { new: true }
      )
    success(res, 200, disapprove)
  } catch (err) {
    next(err)
  }
}

exports.showAllWithdrawHistory = async (req, res, next) => {
  try {
    if (!req.user._id) return error(400, 'You should login to perform this action')
    const show = await withdrawHistory
      .find({ branch: req.user._id })
      .populate({
        path: 'user',
        select: ['first_name', 'last_name', 'account_number']
      })
    success(res, 200, show)
  } catch (err) {
    next(err)
  }
}

exports.showWithdrawHistoryById = async (req, res, next) => {
  try {
    if (!req.user._id) return error(400, 'You should login to perform this action')
    const show = await withdrawHistory
      .findOne({
        _id: req.params.withdrawHistory_id,
        branch: req.user._id
      })
      .populate({
        path: 'branch',
        select: ['branch_name', 'address']
      })
      .populate({
        path: 'user',
        select: ['first_name', 'last_name', 'addresses', 'account_number']
      })
    success(res, 200, show)
  } catch (err) {
    next(err)
  }
}
