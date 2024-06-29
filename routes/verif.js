const { Router } = require('express')
const router = Router()

const { verifController } = require('../controllers')

router.post('/send/otp', verifController.sendOTP)
router.post('/verify/otp', verifController.verifyOTP)

module.exports = router
