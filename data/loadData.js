const mongoose = require('mongoose')
const ItemType = require('../models/itemType')
const data = require('./item-type-data.json')
require('dotenv').config()

mongoose.connect(process.env.DB_CONNECTION, {
  useNewUrlParser: true,
  useFindAndModify: false,
  useCreateIndex: true,
  useUnifiedTopology: true
})
  .then(console.log('connected'))

// Load all sample data

async function loadItemTypes () {
  try {
    await ItemType.insertMany(data)
    console.log('Succesfully insert item types to the record')
    process.exit()
  } catch (err) {
    console.error(err)
    process.exit()
  }
}

async function deleteItemTypes () {
  try {
    await ItemType.deleteMany()
    console.log('Succesfully delete item types from the record')
    process.exit()
  } catch (err) {
    console.error(err)
    process.exit()
  }
}

if (process.argv.includes('delete')) {
  deleteItemTypes()
} else {
  loadItemTypes()
}
