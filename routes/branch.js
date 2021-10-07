const multer = require('multer')
const express = require('express')
const router = express.Router()

const isAuthenticated = require('../middlewares/authenticate')
const branch = require('../controllers/branchController')

router.post('/register', branch.register)
router.get('/verify/:branch_id', branch.verify)
router.post('/login', branch.login)
router.get('/', branch.getAllBranches)
router.get('/current', isAuthenticated, branch.getCurrent)
router.delete('/:branch_id', isAuthenticated, branch.closeTheBranch)
router.put('/update', isAuthenticated, branch.update)
router.put('/upload', isAuthenticated, multer().single('image'), branch.uploadImage)
router.put('/update-password', isAuthenticated, branch.updatePassword)

module.exports = router
