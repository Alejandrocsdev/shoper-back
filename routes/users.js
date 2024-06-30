const { Router } = require('express')
const router = Router()

const { usersController } = require('../controllers')

const { loginAuth } = require('../config/passport')

router.post('/signUp', usersController.signUp)
router.post('/signIn', loginAuth, usersController.signIn)

module.exports = router
