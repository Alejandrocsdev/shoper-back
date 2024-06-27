const { Router } = require('express')
const router = Router()

const { verificationController } = require('../controllers')

router.post('/send/otp', verificationController.sendOtp)

module.exports = router
