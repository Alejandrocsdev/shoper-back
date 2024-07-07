// 引入環境變數
require('dotenv').config()

// 引入加密相關模組
const bcrypt = require('bcryptjs')
const crypto = require('crypto')
const jwt = require('jsonwebtoken')
const sha256 = require('./sha256')

// 引用客製化錯誤訊息模組
const CustomError = require('../errors/CustomError')

class Encrypt {
  // 雜湊
  async hash(data) {
    try {
      const salt = await bcrypt.genSaltSync(10)
      const hashedData = await bcrypt.hash(data, salt)
      return hashedData
    } catch (err) {
      throw new CustomError(500, '雜湊失敗')
    }
  }

  // 雜湊比對
  async hashCompare(data, hashedData) {
    try {
      const isMatch = await bcrypt.compare(data, hashedData)
      return isMatch
    } catch (err) {
      throw new CustomError(500, '雜湊比對失敗')
    }
  }

  // 密鑰
  secret() {
    try {
      const secret = crypto.randomBytes(32).toString('hex')
      return secret
    } catch (err) {
      throw new CustomError(500, '密鑰生成失敗')
    }
  }

  // 隨機帳號
  username() {
    const special = '!@#$%&'
    const upperCase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    const lowerCase = 'abcdefghijklmnopqrstuvwxyz'
    const number = '0123456789'

    const randomize = (charSet) => {
      const randomIndex = Math.floor(Math.random() * charSet.length)
      return charSet[randomIndex]
    }

    let result = []

    for (let i = 0; i < 2; i++) {
      result.push(randomize(special))
    }

    for (let i = 0; i < 2; i++) {
      result.push(randomize(upperCase))
    }

    for (let i = 0; i < 2; i++) {
      result.push(randomize(number))
    }

    for (let i = 0; i < 4; i++) {
      result.push(randomize(lowerCase))
    }

    result.sort(() => Math.random() - 0.5)

    return result.join('')
  }

  // 簡訊 OTP
  otp() {
    try {
      const code = crypto.randomInt(100000, 1000000)
      return String(code)
    } catch (err) {
      throw new CustomError(500, '生成OTP失敗')
    }
  }

  // SHA256 雜湊
  sha256(input) {
    if (typeof input === 'string') {
      return sha256(input)
    } else {
      throw new CustomError(500, 'Fail to hash using sha256.')
    }
  }

  // 綠界交易號碼
  tradeNo(orderId) {
    const timestamp = Date.now()
    const tradeNo = `${orderId}${timestamp}`
    if (tradeNo.length <= 20) {
      return tradeNo
    } else {
      throw new CustomError(500, `TradeNo can't be more than 20 digits.`)
    }
  }

  // .NET編碼的URL加密
  NETUrlEncode(str) {
    if (typeof str === 'string') {
      const customEncode = str.replace(/~/g, '%7E').replace(/%20/g, '+').replace(/'/g, '%27')
      return customEncode
    } else {
      throw new CustomError(500, 'URL加密失敗 (.NET).')
    }
  }

  // Email JWT
  signEmailToken(id) {
    const token = jwt.sign({ id }, process.env.EMAIL_SECRET, { expiresIn: '15m' })
    return token
  }

  // Access JWT
  signAccessToken(id, roles) {
    const token = jwt.sign({ userInfo: { id, roles } }, process.env.AT_SECRET, { expiresIn: '15m' })
    return token
  }

  // Refresh JWT
  signRefreshToken(id) {
    const token = jwt.sign({ id }, process.env.RT_SECRET, { expiresIn: '7d' })
    return token
  }

  // 驗證 JWT
  verifyToken(token, type) {
    let secret
    switch (type) {
      case 'AT':
        secret = process.env.AT_SECRET
        break
      case 'RT':
        secret = process.env.RT_SECRET
        break
      case 'email':
        secret = process.env.EMAIL_SECRET
        break
    }

    const decoded = jwt.verify(token, secret)
    return decoded
  }
}

module.exports = new Encrypt()
