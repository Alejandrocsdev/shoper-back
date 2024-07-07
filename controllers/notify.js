// 引用 Models
const { User } = require('../models')
// 引用異步錯誤處理中間件
const { asyncError } = require('../middlewares')
// 引用 成功回應 / 時間 模組
const { sucRes, time } = require('../utils')
// 引用自定義驗證模組
const Validator = require('../Validator')
// 引用驗證模組
const Joi = require('joi')
// 客製化錯誤訊息模組
const CustomError = require('../errors/CustomError')
// 發送器模組 (信箱)
const sendMail = require('../config/email')
// Body驗證條件(base)
const schema = Joi.object({
  email: Joi.string().email().required()
})

class NotifyController extends Validator {
  constructor() {
    super(schema)
  }

  resetComplete = asyncError(async (req, res, next) => {
    // 驗證請求主體
    this.validateBody(req.body)
    const { email } = req.body

    // 取得用戶資料
    const user = await User.findOne({ where: { email } })

    // 驗證用戶是否存在
    this.validateData([user])

    // 信箱內容資料
    const username = user.username
    const date = time.emailDate()

    // 發送信箱
    await sendMail({ email, username, date }, 'resetComplete')
    // 成功回應
    sucRes(res, 200, '密碼變更通知寄出成功 (gmail)')
  })
}

module.exports = new NotifyController()
