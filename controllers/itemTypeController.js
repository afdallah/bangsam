const ItemType = require('../models/itemType')
const { success, error } = require('../helpers/handler')

exports.getAll = async (req, res, next) => {
  try {
    const items = await ItemType.find()
    success(res, 200, items)
  } catch (err) {
    next(err)
  }
}

exports.updateItemType = async (req, res, next) => {
  const { item_id } = req.params
  const { price } = req.body

  try {
    // Only admin can update the price list
    if (req.user.role !== 'admin') return error(200, 'You are not authorized to do this action')

    const item = await ItemType.findByIdAndUpdate(item_id, {
      $set: { price }
    }, { new: true })

    success(res, 200, item)
  } catch (err) {
    next(err)
  }
}
