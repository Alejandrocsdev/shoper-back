// 引用Sequelize Model
const { sequelize, Otp, User } = require('../models')
// 異步錯誤中間件
const { asyncError } = require('../middlewares')
// 成功回應
const { sucRes } = require('../utils/customResponse')
// 驗證Class
const Validator = require('../Validator')
// 驗證模組
const Joi = require('joi')

const bcrypt = require('bcryptjs')
const crypto = require('crypto')
function generateOtp() {
  const code = crypto.randomInt(100000, 1000000)
  return code
}

// 發送器模組(email/phone)
const sendSMS = require('../config/phone')
const smsType = process.env.SMS_TYPE
// 自定義錯誤訊息
const CustomError = require('../errors/CustomError')
// Body驗證條件(base)
const schema = Joi.object({
  email: Joi.string().email(),
  phone: Joi.string().pattern(/^09/).length(10)
}).xor('email', 'phone')
// Body驗證條件(extra)
const otpBody = { otp: Joi.string().length(6).required() }

class VerifController extends Validator {
  constructor() {
    super(schema)
  }

  sendOTP = asyncError(async (req, res, next) => {
    // 驗證請求主體
    this.validateBody(req.body)
    // method === 'email' || 'phone'
    const [method, methodData] = Object.entries(req.body)[0]

    // 取得用戶資料
    const user = await User.findOne({ where: { [method]: methodData } })

    // 生成OTP
    const otp = generateOtp()
    // OTP有效期限(15分鐘)
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
        sucRes(res, 200, '信箱OTP發送成功 (gmail)')
      } else {
        await sendSMS(methodData, otp, smsType)
        sucRes(res, 200, `簡訊OTP發送成功 (${smsType})`)
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

    // 讀取單一資料
    const [user, otpData] = await Promise.all([
      User.findOne({ where: { phone: methodData } }),
      Otp.findOne({ where: { methodData } })
    ])

    // 驗證工具中文訊息
    const Method = method === 'email' ? '信箱' : '電話'

    // 驗證資料是否存在
    this.validateData([otpData], `表格查無 ${Method}: ${methodData} 資料`)

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
        // 刪除Otp資訊
        await Otp.destroy({ where: { otp: hashedOtp } })
        if (isMatch) {
          const message = user ? '已註冊過手機號碼' : `成功驗證${Method}OTP`
          const filteredUser = user.toJSON()
          delete filteredUser.password
          sucRes(res, 200, message, filteredUser)
        } else if (expireTime <= Date.now()) {
          throw new CustomError(401, '您輸入的驗證碼已經過期。請再次嘗試請求新的驗證碼。')
        } else if (attempts > 5) {
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

module.exports = new VerifController()
