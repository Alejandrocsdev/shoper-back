const { sequelize, User, Otp } = require('../models')

const { asyncError } = require('../middlewares')

const { sucRes } = require('../utils/customResponse')

const Validator = require('../Validator')

const Joi = require('joi')

const bcrypt = require('bcryptjs')

const crypto = require('crypto')

function generateOtp() {
  const code = crypto.randomInt(100000, 1000000)
  return code
}

const sendSMS = require('../config/phone')

const smsType = process.env.SMS_TYPE

const CustomError = require('../errors/CustomError')

const schema = Joi.object({
  email: Joi.string().email(),
  phone: Joi.string().pattern(/^09/).length(10)
}).xor('email', 'phone')

const otpBody = { otp: Joi.string().length(6).required() }

class VerificationController extends Validator {
  constructor() {
    super(schema)
  }

  sendOTP = asyncError(async (req, res, next) => {
    // 驗證請求主體
    this.validateBody(req.body)
    // method === 'email' || 'phone'
    const [method, methodData] = Object.entries(req.body)[0]

    // 生成OTP
    const otp = generateOtp()
    // OTP有效期限
    const expireTime = Date.now() + 15 * 60 * 1000

    const [hashedOtp, otpData] = await Promise.all([
      // OTP加密
      bcrypt.hash(String(otp), 10),
      // 檢查OTP是否已存在
      Otp.findOne({ where: { methodData } })
    ])

    // 建立事務
    const transaction = await sequelize.transaction()

    try {
      if (otpData) {
        // OTP已存在: 更新OTP
        await Otp.update(
          { otp: hashedOtp, expireTime, attempts: 0 },
          { where: { methodData }, transaction }
        )
      } else {
        // OTP不存在: 建立OTP
        await Otp.create({ methodData, otp: hashedOtp, expireTime }, { transaction })
      }

      // 提交事務
      await transaction.commit()

      if (method === 'email') {
        // await sendMail(methodData, otp)
        sucRes(res, 200, 'Email with OTP sent successfully (gmail).')
      } else {
        await sendSMS(methodData, otp, smsType)
        sucRes(res, 200, `SMS with OTP sent successfully. (${smsType})`)
      }
    } catch (err) {
      // 回滾事務
      await transaction.rollback()
      next(err)
    }
  })

  verifyOTP = asyncError(async (req, res, next) => {
    // 驗證請求主體
    this.validateBody(req.body, otpBody)
    // method === 'email' || 'phone'
    const [method, methodData] = Object.entries(req.body)[0]
    const { otp } = req.body
    console.log(otp)

    // 讀取單一資料
    const otpData = await Otp.findOne({ where: { methodData } })
    // 驗證資料是否存在
    this.validateData([otpData], `Table data not found with ${method}: ${methodData}.`)

    // 取得加密OTP
    const hashedOtp = otpData.otp
    // 驗證OTP是否正確
    const isMatch = await bcrypt.compare(otp, hashedOtp)
    // 取得OTP有效期限
    const expireTime = otpData.expireTime
    // 取得嘗試輸入OTP次數
    const attempts = otpData.attempts + 1

    // 建立事務
    const transaction = await sequelize.transaction()

    try {
      // OTP正確/OTP失效/嘗試次數過多: 刪除Otp資訊
      if (isMatch || expireTime <= Date.now() || attempts > 5) {
        if (isMatch) {
          // 刪除Otp資訊
          await Otp.destroy({ where: { otp: hashedOtp } })
          sucRes(res, 200, `OTP verified with ${method} successfully.`)
        } else if (expireTime <= Date.now()) {
          // 刪除Otp資訊
          await Otp.destroy({ where: { otp: hashedOtp } })
          throw new CustomError(401, '您輸入的驗證碼已經過期。請再次嘗試請求新的驗證碼。')
        } else if (attempts > 5) {
          // 刪除Otp資訊
          await Otp.destroy({ where: { otp: hashedOtp } })
          throw new CustomError(429, '輸入錯誤達5次。請再次嘗試請求新的驗證碼。')
        }
      }
      // 未達嘗試限制: 更新嘗試次數
      else {
        // 更新Otp資訊
        await Otp.update({ attempts }, { where: { otp: hashedOtp } })
        throw new CustomError(401, '無效的驗證碼。')
      }

      // 提交事務
      await transaction.commit()
    } catch (err) {
      // 回滾事務
      await transaction.rollback()
      next(err)
    }
  })
}

module.exports = new VerificationController()
