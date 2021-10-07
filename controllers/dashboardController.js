const { success, error } = require('../helpers/handler')
const User = require('../models/user')
const Branch = require('../models/branch')
const Pickup = require('../models/pickup')
const Withdraw = require('../models/withdrawHistory')

exports.getDashboard = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') return error(401, 'You are not allowed to do this action')

    const totalBranchesQuery = Branch.countDocuments()
    const totalSuspendedBranchesQuery = Branch.aggregate([
      { $match: { blocked: true } }
    ])

    const totalUsersQuery = User.countDocuments()
    const totalSuspendedUsersQuery = User.aggregate([
      { $match: { blocked: true } }
    ])

    const totalPickupsQuery = Pickup.countDocuments()

    const totalWithdrawQuery = Withdraw.countDocuments()
    const withdrawAmountQuery = Withdraw
      .aggregate()
      .match({})
      .group({ _id: '', count: { $sum: '$amount' } })

    const depositAmountQuery = Pickup
      .aggregate()
      .match({})
      .group({ _id: '', count: { $sum: '$amount' } })

    let [
      totalBranches,
      totalSuspendedBranches,
      totalUsers,
      totalSuspendedUsers,
      totalPickups,
      totalWithdraw,
      depositAmount,
      withdrawAmount
    ] = await Promise.all([
      totalBranchesQuery,
      totalSuspendedBranchesQuery,
      totalUsersQuery,
      totalSuspendedUsersQuery,
      totalPickupsQuery,
      totalWithdrawQuery,
      depositAmountQuery,
      withdrawAmountQuery
    ])

    totalSuspendedBranches = totalSuspendedBranches.length
    totalSuspendedUsers = totalSuspendedUsers.length
    const totalDeposit = totalPickups

    const result = {
      branch: {
        total: totalBranches,
        suspended: totalSuspendedBranches
      },
      customer: {
        total: totalUsers,
        suspended: totalSuspendedUsers
      },
      pickups: {
        total: totalPickups
      },
      balance: {
        total: totalDeposit,
        amount: depositAmount.length ? depositAmount[0].count : 0
      },
      withdraw: {
        total: totalWithdraw,
        amount: depositAmount.length ? withdrawAmount[0].count : 0
      }
    }

    success(res, 200, result)
  } catch (err) {
    next(err)
  }
}
