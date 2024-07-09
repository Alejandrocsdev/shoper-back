// 引用 Models
const { sequelize, Otp, User } = require('../models')
// 引用異步錯誤處理中間件
const { asyncError } = require('../middlewares')
// 引用 成功回應 / 加密 模組
const { sucRes, encrypt } = require('../utils')
// 引用自定義驗證模組
const Validator = require('../Validator')
// 引用驗證模組
const Joi = require('joi')
// 客製化錯誤訊息模組
const CustomError = require('../errors/CustomError')
// 發送器模組 (信箱 / 電話)
const sendSMS = require('../config/phone')
const sendMail = require('../config/email')
const smsType = process.env.SMS_TYPE
// Body驗證條件(base)
const schema = Joi.object({
  email: Joi.string().email(),
  phone: Joi.string().pattern(/^09/).length(10)
}).xor('email', 'phone')
// Body驗證條件(extra)
const otpBody = { otp: Joi.string().length(6).required() }

class VerifyController extends Validator {
  constructor() {
    super(schema)
  }

  sendOTP = asyncError(async (req, res, next) => {
    // 驗證請求主體
    this.validateBody(req.body)
    const { phone } = req.body

    // 生成 OTP
    const otp = encrypt.otp()
    // OTP 有效期限(15分鐘)
    const expireTime = Date.now() + 15 * 60 * 1000

    const [hashedOtp, otpRecord, user] = await Promise.all([
      // OTP 加密
      encrypt.hash(otp),
      // 取得 OTP 資料
      Otp.findOne({ where: { phone } }),
      // 取得用戶資料
      User.findOne({ where: { phone } })
    ])

    // 建立事務
    const transaction = await sequelize.transaction()

    try {
      if (otpRecord) {
        // OTP 已存在: 更新OTP
        await Otp.update(
          { otp: hashedOtp, expireTime, attempts: 0 },
          { where: { phone }, transaction }
        )
      } else {
        // OTP 不存在: 建立OTP
        await Otp.create({ phone, otp: hashedOtp, expireTime }, { transaction })
      }

      // 提交事務
      await transaction.commit()
      // 發送簡訊
      await sendSMS(phone, otp, smsType)
      // 成功回應
      sucRes(res, 200, `簡訊OTP發送成功 (${smsType})`)
    } catch (err) {
      // 回滾事務
      await transaction.rollback()
      next(err)
    }
  })

  verifyOTP = asyncError(async (req, res, next) => {
    // 驗證請求主體
    this.validateBody(req.body, otpBody)
    const { phone, otp } = req.body

    // 讀取單一資料
    const otpRecord = await Otp.findOne({ where: { phone } })

    // 驗證 OTP 是否存在
    this.validateData([otpRecord])

    // 取得加密 OTP
    const hashedOtp = otpRecord.otp
    // 驗證 OTP 是否正確
    const isMatch = await encrypt.hashCompare(otp, hashedOtp)
    // 取得 OTP 有效期限
    const expireTime = otpRecord.expireTime
    // 取得嘗試輸入 OTP 次數
    const attempts = otpRecord.attempts + 1

    // 建立事務
    const transaction = await sequelize.transaction()

    try {
      // 刪除Otp資訊: OTP 正確 / OTP 失效 / 嘗試次數過多
      if (isMatch || expireTime <= Date.now() || attempts > 5) {
        // 刪除Otp資訊
        await Otp.destroy({ where: { otp: hashedOtp } })

        // OTP 正確
        if (isMatch) {
          sucRes(res, 200, '成功驗證手機OTP')
        }
        // OTP 失效
        else if (expireTime <= Date.now()) {
          throw new CustomError(401, '您輸入的驗證碼已經過期。請再次嘗試請求新的驗證碼。')
        }
        // 嘗試次數過多
        else if (attempts > 5) {
          throw new CustomError(429, '輸入錯誤達5次。請再次嘗試請求新的驗證碼。')
        }
      }
      // 未達嘗試限制: 更新嘗試次數
      else {
        // 更新Otp資訊
        await Otp.update({ attempts }, { where: { phone } })
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

  sendLink = asyncError(async (req, res, next) => {
    // 驗證請求主體
    this.validateBody(req.body)
    const { email } = req.body

    // 取得用戶資料
    const user = await User.findOne({ where: { email } })

    // 驗證用戶是否存在
    this.validateData([user])

    // 信箱內容資料
    const username = user.username
    const token = encrypt.signEmailToken(user.id)
    const backUrl =
      process.env.NODE_ENV === 'development'
        ? process.env.FRONT_DEV_BASE_URL
        : process.env.FRONT_PROD_BASE_URL
    const link = `${backUrl}/verify/link?token=${token}`

    // 發送信箱
    await sendMail({ email, username, link }, 'resetLink')
    // 成功回應
    sucRes(res, 200, '信箱OTP發送成功 (gmail)')
  })

  verifyLink = asyncError(async (req, res, next) => {
    const { token } = req.query

    // 導向前端連結
    const url = (verified, result) => {
      const frontUrl =
        process.env.NODE_ENV === 'development'
          ? process.env.FRONT_DEV_BASE_URL
          : process.env.FRONT_PROD_BASE_URL
      return `${frontUrl}/reset?verified=${verified}&result=${result}`
    }

    try {
      const { id } = encrypt.verifyToken(token, 'email')
      const user = await User.findByPk(id)

      if (!user) res.redirect(url(false, 'Email未被註冊'))

      // 成功回應
      res.redirect(url(true, user.email))
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        res.redirect(url(false, '連結過期'))
      } else {
        res.redirect(url(false, '連結無效'))
      }
    }
  })
}

module.exports = new VerifyController()
