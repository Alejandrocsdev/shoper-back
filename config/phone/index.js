// 引用簡訊發送器模組
const twilio = require('./twilio')
const twsms = require('./twsms')

// 發送簡訊
function sendSMS(phone, otp, smsType) {
  // 依環境變數使用 TwSMS / Twilio 簡訊發送器
  switch (true) {
    case smsType === 'twilio':
      return twilio('+886' + phone.slice(1), otp)
      break
    case smsType === 'twsms':
      return twsms(phone, otp)
      break
  }
}

module.exports = sendSMS
