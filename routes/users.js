const { Router } = require('express')
const router = Router()

const { usersController } = require('../controllers')

const { pwdSignInAuth, smsSignInAuth } = require('../config/passport')

// Most Specific Route First
router.post('/signIn/auto/:userId', usersController.autoSignIn)

// Routes dealing with specific fields
router.get('/phone/:phone', usersController.getUserByPhone)
router.put('/phone/:phone', usersController.putUserByPhone)
router.put('/email/:email', usersController.putUserByEmail)

// Routes with userId
router.put('/:userId', usersController.putUser)
router.get('/:userId', usersController.getUserById)

// General Routes
router.get('/', usersController.getUsers)

// Authentication and Signup Routes
router.post('/signUp', usersController.signUp)
router.post('/signIn/pwd', pwdSignInAuth, usersController.signIn)
router.post('/signIn/sms', smsSignInAuth, usersController.signIn)

module.exports = router
