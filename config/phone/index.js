// 引用簡訊供應商模組
const twilio = require('./twilio')
const twsms = require('./twsms')

// 發送簡訊
function sendSMS(phone, otp, smsType) {
  // 加上國碼
  const codedPhone = '+886' + phone.slice(1)

  // 依環境變數使用TwSMS/Twilio簡訊供應商
  switch (true) {
    case smsType === 'twilio':
      return twilio(codedPhone, otp)
      break
    case smsType === 'twsms':
      return twsms(phone, otp)
      break
  }
}

module.exports = sendSMS
