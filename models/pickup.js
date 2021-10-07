const mongoose = require('mongoose')
const Schema = mongoose.Schema

const pickupSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  branch: {
    type: Schema.Types.ObjectId,
    ref: 'Branch'
  },
  is_completed: {
    type: Boolean,
    default: false
  },
  item_details: [{
    type: Object
  }],
  estimated_time: {
    type: Number,
    default: 0
  },
  amount: {
    type: Number,
    default: 0
  },
  address: {
    type: Schema.Types.ObjectId,
    ref: 'Address'
  },
  transaction_id: {
    type: String,
    default: 'BA' + Date.now()
  },
  reason: {
    type: String,
    default: ''
  },
  point: {
    type: Number
  }
}, {
  versionKey: false,
  timestamps: true
})

module.exports = mongoose.model('Pickup', pickupSchema)
