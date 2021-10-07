const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')
const mongoosePaginate = require('mongoose-paginate-v2')
const Schema = mongoose.Schema
mongoosePaginate.paginate.options = {
  limit: 10,
  sort: { createdAt: -1 }
}

const branchSchema = new Schema({
  branch_name: {
    type: String,
    trim: true
  },
  phone_number: {
    type: String,
    unique: true,
    required: 'Phone number is required'
  },
  password_digest: {
    type: String,
    required: 'Password is required'
  },
  address: {
    type: String,
    trim: true,
    minlength: 10
  },
  image: {
    type: String,
    default: 'https://ik.imagekit.io/dallah/bank-logo_l9tr4j6wG.png'
  },
  blocked: {
    type: Boolean,
    default: false
  },
  request_id: {
    type: String,
    default: ''
  },
  is_verified: {
    type: Boolean,
    default: false
  }
}, {
  versionKey: false,
  timestamps: true
})

branchSchema.plugin(mongoosePaginate)
branchSchema.plugin(uniqueValidator)
module.exports = mongoose.model('Branch', branchSchema)
