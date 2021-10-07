const mongoose = require('mongoose')

const { success, error } = require('../helpers/handler')
const Balance = require('../models/balance')
const Pickup = require('../models/pickup')
const WithdrawHistory = require('../models/withdrawHistory')

const ObjectId = mongoose.Types.ObjectId

exports.sumUser = async (req, res, next) => {
  const id = req.user._id
  try {
    const balance = await Balance
      .aggregate()
      .match({ user: ObjectId(id) })
      .group({ _id: '$_id', total: { $sum: '$total' } })

    success(res, 200, balance)
  } catch (err) {
    next(err)
  }
}

exports.sumBranch = async (req, res, next) => {
  const id = req.user._id
  try {
    const balance = await Balance
      .aggregate()
      .match({ branch: ObjectId(id) })
      .group({ _id: '$_id', total: { $sum: '$total' } })

    success(res, 200, balance)
  } catch (err) {
    next(err)
  }
}

exports.showUserDetailBalance = async (req, res, next) => {
  const id = req.user._id
  try {
    const balance = await Balance.find({ user: id })
      .populate({
        path: 'branch',
        select: ['phone_number', 'branch_name', 'address']
      })
    success(res, 200, balance)
  } catch (err) {
    next(err)
  }
}

exports.showBranchDetailBalance = async (req, res, next) => {
  const id = req.user._id
  try {
    const balance = await Balance.find({ branch: id })
      .populate({
        path: 'branch',
        select: ['phone_number', 'first_name', 'last_name', 'address']
      })
    success(res, 200, balance)
  } catch (err) {
    next(err)
  }
}

exports.withdraw = async (req, res, next) => {
  const user = req.user._id
  const { branch_id: branch } = req.params
  const { cash } = req.body

  try {
    const balance = await Balance.findOne({ user, branch })
    if (balance.total < cash) {
      return error(422, 'Insufficient funds')
    } else {
      const history = await WithdrawHistory.create({
        user,
        branch,
        amount: cash,
        transaction_id: 'BA' + Date.now()
      })

      // const [withdraw] = await Promise.all([withdrawQuery, historyQuery])
      success(res, 200, history)
    }
  } catch (err) {
    next(err)
  }
}

exports.getBooks = async (req, res, next) => {
  try {
    // Get branch related to user's pickup

    let books = await Balance.find({ user: req.user._id })
      .select(['-user', '-transaction'])
      .populate({
        path: 'branch',
        select: ['branch_name', 'address', 'image']
      })

    books = books.map(book => {
      return {
        _id: book._id,
        total_balance: book.total,
        ...book.branch._doc
      }
    })

    success(res, 200, books)
  } catch (err) {
    next(err)
  }
}

exports.getBookById = async (req, res, next) => {
  const { branch_id: branch } = req.params
  try {
    const transactionsQuery = Pickup
      .find({ user: req.user._id, branch, is_completed: true, reason: '' })
      .select(['amount', 'branch', 'item_details', 'updatedAt', 'createdAt', 'transaction_id', 'point'])

      .populate({
        path: 'branch',
        select: ['branch_name', 'phone_number', 'address']
      })

    // const totalQuery = Pickup
    //   .aggregate()
    //   .match({ branch: ObjectId(req.params.branch_id), user: ObjectId(req.user._id) })
    //   .group({ _id: '', count: { $sum: '$amount' } })

    const balanceQuery = Balance.findOne({ user: req.user._id, branch })

    const withdrawQuery = WithdrawHistory.find({ user: req.user._id, branch })
      .select('-user')
      .populate({
        path: 'branch',
        select: ['branch_name', 'address', 'phone_number']
      })

    // Request in parallel
    let [
      transactions,
      balance,
      withdraw
    ] = await Promise.all([transactionsQuery, balanceQuery, withdrawQuery])

    // restructure the response
    // transactions = transactions.map(item => ({
    //   _id: item._id,
    //   ...excludeProps(item.transaction._doc, '_id'),
    //   ...excludeProps(item.branch._doc, '_id')
    // }))

    transactions = transactions.map(item => {
      return {
        type: 'deposit',
        ...item._doc
      }
    })

    withdraw = withdraw.map(item => {
      return {
        type: 'withdraw',
        ...item._doc
      }
    })

    const result = transactions
      .concat(withdraw)
      .sort(function (a, b) {
        return new Date(b.updatedAt) - new Date(a.updatedAt)
      })

    success(res, 200, { total_balance: balance.total, transactions: result })
  } catch (err) {
    next(err)
  }
}
