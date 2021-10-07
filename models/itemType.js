const mongoose = require('mongoose')
const Schema = mongoose.Schema

const itemTypeSchema = new Schema({
  name: {
    type: String,
    trim: true
  },
  price: {
    type: Number,
    default: 0
  }
}, {
  versionKey: false,
  timestamps: true
})

const itemType = mongoose.model('ItemType', itemTypeSchema)
module.exports = itemType
