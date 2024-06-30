// 引入環境變數
require('dotenv').config()

// 引入加密模組
const bcrypt = require('bcryptjs')
const crypto = require('crypto')
const jwt = require('jsonwebtoken')
const srp = require('secure-random-password')
const sha256 = require('./sha256')

// 自定義錯誤訊息
const CustomError = require('../errors/CustomError')

class Encrypt {
  async hash(data) {
    try {
      const salt = await bcrypt.genSaltSync(10)
      const hashedData = await bcrypt.hash(data, salt)
      return hashedData
    } catch (err) {
      throw new CustomError(500, 'Fail to hash.')
    }
  }

  async hashCompare(data, hashedData) {
    try {
      const isMatch = await bcrypt.compare(data, hashedData)
      return isMatch
    } catch (err) {
      throw new CustomError(500, 'Fail to compare hash.')
    }
  }

  secret() {
    try {
      const secret = crypto.randomBytes(32).toString('hex')
      return secret
    } catch (err) {
      throw new CustomError(500, 'Fail to generate secret.')
    }
  }

  password(length) {
    try {
      return srp.randomPassword({
        length: length,
        characters: srp.digits + srp.lower + srp.upper + srp.symbols
      })
    } catch (err) {
      throw new CustomError(500, 'Fail to generate temporary password.')
    }
  }

  otp() {
    try {
      const code = crypto.randomBytes(4).toString('hex')
      const uppercaseCode = code.toUpperCase()
      return uppercaseCode
    } catch (err) {
      throw new CustomError(500, 'Fail to generate OTP.')
    }
  }

  sha256(input) {
    if (typeof input === 'string') {
      return sha256(input)
    } else {
      throw new CustomError(500, 'Fail to hash using sha256.')
    }
  }

  tradeNo(orderId) {
    const timestamp = Date.now()
    const tradeNo = `${orderId}${timestamp}`
    if (tradeNo.length <= 20) {
      return tradeNo
    } else {
      throw new CustomError(500, `TradeNo can't be more than 20 digits.`)
    }
  }

  NETUrlEncode(str) {
    if (typeof str === 'string') {
      const customEncode = str.replace(/~/g, '%7E').replace(/%20/g, '+').replace(/'/g, '%27')
      return customEncode
    } else {
      throw new CustomError(500, 'Fail to encode URL (.NET).')
    }
  }

  signToken(id, expiresIn) {
    try {
      const token = jwt.sign({ id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn })
      const decoded = jwt.decode(token)
      const tokenData = {
        value: token,
        validity: { iat: decoded.iat, exp: decoded.exp, expiresIn }
      }
      return tokenData
    } catch (err) {
      throw new CustomError(500, 'Fail to sign token.')
    }
  }
}

module.exports = new Encrypt()
