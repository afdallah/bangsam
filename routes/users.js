const express = require('express')
const router = express.Router()
const user = require('../controllers/userController.js')
const isAuthenticated = require('../middlewares/authenticate.js')
/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('Display all users')
})

router.post('/register', user.register)
router.post('/login', user.login)
router.get('/verify/:user_id', user.verify)
router.get('/current', isAuthenticated, user.current)
router.put('/current/address/:address_id', isAuthenticated, user.updateUserAddress)
router.get('/show', user.show)
router.put('/update', isAuthenticated, user.update)
router.put('/update-password', isAuthenticated, user.updatePassword)
module.exports = router
