// 引用 axios
const axios = require('axios')
// TwSMS 帳號資料
const BASE_API = process.env.TWSMS_API
const username = process.env.TWSMS_USERNAME
const password = process.env.TWSMS_PASSWORD

// 自定義錯誤訊息
const CustomError = require('../../../errors/CustomError')

// 簡訊發送日期生成
function smsDate() {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}${month}${day}${hours}${minutes}`
}

// 發送報告
const drurl = process.env.TWSMS_DRURL ? `drurl=${process.env.TWSMS_DRURL}&` : ''
const drurl_check = drurl ? 'Y' : 'N'
// 其他設置
const optional = `&sendTime=${smsDate()}&expirytime=28800&mo=N&${drurl}drurl_check=${drurl_check}&lmsg=N`

// TwSMS 簡訊發送器
async function twsms(phone, otp) {
  const message = `【瞎皮爾購物】輸入 ${otp} 以建立您的帳號，15 分鐘內有效。請不要將驗證碼分享給任何人，包括瞎皮爾員工。`
  const API = `${BASE_API}?username=${username}&password=${password}&mobile=${phone}&message=${message}${optional}`
  try {
    if (!username) throw new CustomError(500, '缺少: TwSMS 帳號.')
    if (!password) throw new CustomError(500, '缺少: TwSMS 密碼.')

    // 發送簡訊
    await axios.get(API)
  } catch (err) {
    throw new CustomError(500, 'OTP發送失敗 (TwSMS)')
  }
}

module.exports = twsms
