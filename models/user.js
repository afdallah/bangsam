const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')
const mongoosePaginate = require('mongoose-paginate-v2')
const Schema = mongoose.Schema
mongoosePaginate.paginate.options = {
  limit: 10,
  sort: { createdAt: -1 }
}

var validateEmail = function (email) {
  var re = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/
  return re.test(email)
}

const userSchema = new Schema({
  first_name: {
    type: String,
    required: 'Name field is required'
  },
  last_name: {
    type: String
  },
  role: {
    type: String,
    enum: ['nasabah', 'admin'],
    default: 'nasabah',
    required: true
  },
  phone_number: {
    type: String,
    required: 'Phone number is required',
    trim: true,
    unique: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    unique: true,
    validate: [validateEmail, 'Please fill a valid email address']
  },
  password_digest: {
    type: String,
    trim: true,
    required: true
  },
  addresses: [{
    ref: 'Address',
    type: Schema.Types.ObjectId
  }],
  account_number: {
    type: Number
  },
  blocked: {
    type: Boolean,
    default: false
  },
  is_verified: {
    type: Boolean,
    default: false
  },
  request_id: {
    type: String
  }
}, {
  versionKey: false,
  timestamps: true,
  toObject: { virtuals: true },
  toJSON: { virtuals: true }
})

userSchema.plugin(uniqueValidator)
userSchema.plugin(mongoosePaginate)
userSchema
  .virtual('full_name')
  .get(function () {
    if (this.last_name) {
      return this.first_name + ' ' + this.last_name
    }

    return this.first_name
  })
  .set(function (full_name) {
    const arr = this.full_name.split(' ')
    const first_name = arr.slice(0, arr.length - 1)
    const last_name = arr.slice(arr.length - 1)
    this.set({ first_name, last_name })
  })

const User = mongoose.model('User', userSchema)
module.exports = User
