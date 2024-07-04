const { Router } = require('express')
const router = Router()

const { usersController } = require('../controllers')

const { pwdSignInAuth, smsSignInAuth } = require('../config/passport')

router.get('/', usersController.getUsers)
router.get('/:userId', usersController.getUser)
router.get('/phone/:phone', usersController.getUser)

router.post('/signUp', usersController.signUp)

router.post('/signIn/pwd', pwdSignInAuth, usersController.signIn)
router.post('/signIn/sms', smsSignInAuth, usersController.signIn)
router.post('/signIn/auto', usersController.autoSignIn)

module.exports = router
