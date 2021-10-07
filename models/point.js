
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const pointSchema = new Schema({
  point: {
    type: Number,
    default: 0
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  transaction: {
    type: Schema.Types.ObjectId,
    ref: 'Pickup'
  }
}, {
  versionKey: false,
  timestamps: true
})

module.exports = mongoose.model('Point', pointSchema)
