const { Router } = require('express')
const router = Router()

const { verificationController } = require('../controllers')

router.post('/send/otp', verificationController.sendOTP)
router.post('/verify/otp', verificationController.verifyOTP)

module.exports = router
