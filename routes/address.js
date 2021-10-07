const express = require('express')
const router = express.Router()

const address = require('../controllers/addressController')
const isAuthenticated = require('../middlewares/authenticate')

router.get('/provinces', address.getProvinces)
router.get('/districts/:prov_id', address.getDistricts)
router.get('/regencies/:dist_id', address.gerRegencies)
router.get('/villages/:reg_id', address.getVillages)
router.delete('/:address_id', isAuthenticated, address.removeAddress)

module.exports = router
