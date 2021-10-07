const express = require('express')
const router = express.Router()
const itemType = require('../controllers/itemTypeController')
const isAuthenticated = require('../middlewares/authenticate')

router.get('/', itemType.getAll)
router.put('/:item_id', isAuthenticated, itemType.updateItemType)

module.exports = router
