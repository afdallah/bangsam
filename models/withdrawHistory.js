const mongoose = require('mongoose')
const Schema = mongoose.Schema

const withdrawHistorySchema = Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  branch: {
    type: Schema.Types.ObjectId,
    ref: 'Branch'
  },
  amount: {
    type: Number,
    default: 0
  },
  is_completed: {
    type: Boolean,
    default: false
  },
  reason: {
    type: String,
    default: ''
  },
  transaction_id: {
    type: String,
    default: 'BA' + Date.now()
  }
}, {
  versionKey: false,
  timestamps: true
})

module.exports = mongoose.model('WithdrawHistory', withdrawHistorySchema)
