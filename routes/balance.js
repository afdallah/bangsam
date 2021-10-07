const express = require('express')
const router = express.Router()
const isAuthenticated = require('../middlewares/authenticate')

const balance = require('../controllers/balanceController')

router.get('/sum-users', isAuthenticated, balance.sumUser)
router.get('/sum-branches', isAuthenticated, balance.sumBranch)
router.get('/show-users', isAuthenticated, balance.showUserDetailBalance)
router.get('/show-branches', isAuthenticated, balance.showBranchDetailBalance)
router.post('/withdraw/:branch_id', isAuthenticated, balance.withdraw)
router.get('/branches', isAuthenticated, balance.getBooks)
router.get('/branches/:branch_id', isAuthenticated, balance.getBookById)

module.exports = router
