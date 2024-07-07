const { Router } = require('express')
const router = Router()

const { verifyController } = require('../controllers')

// 簡訊
router.post('/send/otp', verifyController.sendOTP)
router.post('/otp', verifyController.verifyOTP)

// 信箱
router.post('/send/link', verifyController.sendLink)
router.get('/link', verifyController.verifyLink)

module.exports = router
