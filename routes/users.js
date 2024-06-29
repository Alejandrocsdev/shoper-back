const { Router } = require('express')
const router = Router()

const { usersController } = require('../controllers')

router.post('/', usersController.signUp)

module.exports = router
