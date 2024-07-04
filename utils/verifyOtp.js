const { sequelize, User, Otp } = require('../../models')

const encrypt = require('../../utils/encrypt')

const CustomError = require('../../errors/CustomError')

const verifyOtp = async (req, res, cb) => {
  try {
    const { phone, otp } = req.body
    if (!phone || !otp) throw new CustomError(400, '缺少電話號碼或OTP驗證碼')

    const [user, otpRecord] = await Promise.all([
      User.findOne({ where: { phone } }),
      Otp.findOne({ where: { phone } })
    ])

    if (!user) throw new CustomError(404, '此電話未註冊')

    // 取得加密OTP
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
      cb(err)
    }
  } catch (err) {
    cb(err)
  }
}

const smsStrategy = new Strategy(verifyCallback)

module.exports = smsStrategy
