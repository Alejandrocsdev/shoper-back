const { Router } = require('express')
const router = Router()

const verification = require('./verification')

router.use('/verification', verification)

module.exports = router
