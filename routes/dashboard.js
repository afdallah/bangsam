const express = require('express')
const router = express.Router()

const dashboard = require('../controllers/dashboardController')
const isAuthenticated = require('../middlewares/authenticate')

router.get('/', isAuthenticated, dashboard.getDashboard)

module.exports = router
