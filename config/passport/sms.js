// 引用 Passport-Custom 模組
const { Strategy } = require('passport-custom')
// 引用 Models
const { sequelize, User, Otp } = require('../../models')
// 引用加密模組
const { encrypt } = require('../../utils')
// 引用客製化錯誤訊息模組
const CustomError = require('../../errors/CustomError')

// 驗證函式
const verifyCallback = async (req, cb) => {
  try {
    // 從請求主體取得資料
    const { phone, otp } = req.body
    if (!phone || !otp) throw new CustomError(400, '缺少電話號碼或OTP驗證碼')

    // 確認資料是否存在
    const [user, otpRecord] = await Promise.all([
      User.findOne({ where: { phone } }),
      Otp.findOne({ where: { phone } })
    ])
    if (!user) throw new CustomError(404, '此電話未註冊')

    // 取得資料庫加密OTP
    const hashedOtp = otpRecord.otp
    // 驗證OTP是否正確
    const isMatch = await encrypt.hashCompare(otp, hashedOtp)
    // 取得OTP有效期限
    const expireTime = otpRecord.expireTime
    // 取得嘗試輸入OTP次數
    const attempts = otpRecord.attempts + 1

    // 建立事務
    const transaction = await sequelize.transaction()

    try {
      // OTP正確 / OTP失效 / 嘗試次數過多: 刪除Otp資訊
      if (isMatch || expireTime <= Date.now() || attempts > 5) {
        // 刪除Otp資訊
        await Otp.destroy({ where: { otp: hashedOtp } })

        if (isMatch) {
          // 傳遞驗證成功的用戶資料
          cb(null, user)
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
      // 傳遞錯誤
      cb(err)
    }
  } catch (err) {
    // 傳遞錯誤
    cb(err)
  }
}

// 定義 SMS 策略
const smsStrategy = new Strategy(verifyCallback)

module.exports = smsStrategy
