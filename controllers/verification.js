const { Otp } = require('../models')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')

function generateOtp() {
  const code = crypto.randomInt(100000, 1000000)
  return code
}

class verificationController {
  sendOtp = async (req, res, next) => {
    const [method, methodData] = Object.entries(req.body)[0]

    const otp = generateOtp()

    const expireTime = Date.now() + 15 * 60 * 1000

    const [hashedOtp, otpData] = await Promise.all([
      // OTP加密
      bcrypt.hash(String(otp), 10),
      // 檢查OTP是否已存在
      Otp.findOne({ where: { methodData } })
    ])

    if (otpData) {
      // OTP已存在: 更新OTP
      await Otp.update({ otp: hashedOtp, expireTime, attempts: 0 }, { where: { methodData } })
    } else {
      // OTP不存在: 建立OTP
      await Otp.create({ methodData, otp: hashedOtp, expireTime })
    }

    if (method === 'email') {
      res.status(200).json({ message: 'Email OTP sent successfully (gmail).' })
    } else {
      res.status(200).json({ message: `SMS OTP sent successfully. (smsType)` })
    }
  }
}

module.exports = new verificationController()
