const express = require('express')
const router = express.Router()
var isAuthenticated = require('../middlewares/authenticate.js')

const pickUp = require('../controllers/pickupController.js')

router.get('/requests/admin', isAuthenticated, pickUp.getAllRequest)
router.get('/requests/user', isAuthenticated, pickUp.getUsersRequests)
router.post('/requests/:branch_id', isAuthenticated, pickUp.sendRequest)
router.get('/requests/:request_id', isAuthenticated, pickUp.getSingleRequest)
router.put('/requests/:request_id', isAuthenticated, pickUp.updateRequest)
router.put('/requests/:request_id/approve', isAuthenticated, pickUp.approveRequest)
router.put('/requests/:request_id/disapprove', isAuthenticated, pickUp.disapproveRequest)

module.exports = router
