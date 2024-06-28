const twilio = require('./twilio')
const twsms = require('./twsms')

function sendSMS(phone, otp, smsType) {
  const codedPhone = '+886' + phone.slice(1)
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
