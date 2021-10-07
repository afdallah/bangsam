const express = require('express')
const router = express.Router()
const withdrawHistory = require('../controllers/withdrawHistoryController')
const isAuthenticated = require('../middlewares/authenticate')

router.put('/:withdrawHistory_id/approve', isAuthenticated, withdrawHistory.approveRequest)
router.put('/:withdrawHistory_id/disapprove', isAuthenticated, withdrawHistory.disapproveRequest)
router.get('/show-all', isAuthenticated, withdrawHistory.showAllWithdrawHistory)
router.get('/show/:withdrawHistory_id', isAuthenticated, withdrawHistory.showWithdrawHistoryById)

module.exports = router
