const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN

const client = require('twilio')(accountSid, authToken)

const options = (phone, otp) => {
  return {
    from: process.env.TWILIO_PHONE,
    to: phone,
    body: `【瞎皮爾購物】輸入 ${otp} 以建立您的帳號，15 分鐘內有效。請不要將驗證碼分享給任何人，包括瞎皮爾員工。`
  }
}

async function twilio(phone, otp) {
  await client.messages.create(options(phone, otp))
}

module.exports = twilio
