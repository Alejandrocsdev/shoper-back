// Twilio 帳號資料
const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN

// 引用 Twilio SDK
const client = require('twilio')(accountSid, authToken)
// 引用客製化錯誤訊息模組
const CustomError = require('../../../errors/CustomError')

// 設定選項
const options = (phone, otp) => {
  return {
    from: process.env.TWILIO_PHONE,
    to: phone,
    body: `【瞎皮爾購物】輸入 ${otp} 以建立您的帳號，15 分鐘內有效。請不要將驗證碼分享給任何人，包括瞎皮爾員工。`
  }
}

// Twilio 簡訊發送器
async function twilio(phone, otp) {
  try {
    if (!accountSid) throw new CustomError(500, '缺少: Twilio Account SID')
    if (!authToken) throw new CustomError(500, '缺少: Twilio Auth Token')

    // 發送簡訊
    await client.messages.create(options(phone, otp))
  } catch (err) {
    throw new CustomError(500, 'OTP發送失敗 (Twilio)')
  }
}

module.exports = twilio
