const mongoose = require('mongoose')
const Schema = mongoose.Schema

const balanceSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  branch: {
    type: Schema.Types.ObjectId,
    ref: 'Branch'
  },
  transaction: {
    type: Schema.Types.ObjectId,
    ref: 'Pickup'
  },
  total: {
    type: Number,
    default: 0
  }
}, {
  versionKey: false,
  timestamps: true
})

const balance = mongoose.model('Balance', balanceSchema)
module.exports = balance
