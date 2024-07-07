const { Router } = require('express')
const router = Router()

const { notifyController } = require('../controllers')

// 簡訊
router.post('/reset/password', notifyController.resetComplete)

module.exports = router
