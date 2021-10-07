const mongoose = require('mongoose')
const Schema = mongoose.Schema

const addressSchema = new Schema({
  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  address_name: {
    type: String,
    trim: true
  },
  province: {
    type: String,
    trim: true
  },
  district: {
    type: String,
    trim: true
  },
  regency: {
    type: String,
    trim: true
  },
  village: {
    type: String,
    trim: true
  },
  address_detail: {
    type: String,
    trim: true
  }
}, {
  versionKey: false,
  timestamps: true
})

const itemType = mongoose.model('Address', addressSchema)
module.exports = itemType
