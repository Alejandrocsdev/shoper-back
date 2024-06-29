const { Router } = require('express')
const router = Router()

const verif = require('./verif')
const users = require('./users')

router.use('/verif', verif)
router.use('/users', users)

module.exports = router
