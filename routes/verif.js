const { Router } = require('express')
const router = Router()

const { verifController } = require('../controllers')

router.post('/send/otp', verifController.sendOTP)
router.post('/send/link', verifController.sendLink)
router.post('/verify/otp', verifController.verifyOTP)
router.get('/verify/link', verifController.verifyLink)

module.exports = router
