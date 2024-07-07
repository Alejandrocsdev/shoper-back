const { Router } = require('express')
const router = Router()

const auth = require('./auth')
const verif = require('./verif')
const users = require('./users')
// const buyer = require('./buyer')
// const seller = require('./seller')

const { jwtAuth } = require('../config/passport')

// 無須登入
router.use('/auth', auth)
router.use('/verif', verif)
router.use('/users', users)

// 需要登入
// router.use('/buyer', jwtAuth, buyer)
// router.use('/seller', jwtAuth, seller)

module.exports = router
