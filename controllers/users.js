// 引用 Models
const { User } = require('../models')
// 引用異步錯誤處理中間件
const { asyncError } = require('../middlewares')
// 引用 成功回應 / 加密 模組
const { sucRes, encrypt, cookie } = require('../utils')
// 引用自定義驗證模組
const Validator = require('../Validator')
// 引用驗證模組
const Joi = require('joi')
// 客製化錯誤訊息模組
const CustomError = require('../errors/CustomError')
// Body驗證條件(base)
const schema = Joi.object({})
// 驗證規則
const username = Joi.string().min(8).max(16).required()
const password = Joi.string()
  .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,16}$/)
  .required()
const phone = Joi.string().pattern(/^09/).length(10).required()
const email = Joi.string().email()
const avatar = Joi.string()
  .uri({ scheme: ['https'] })
  .required()
// Body驗證條件(extra)
const passwordBody = { password }
const createBody = { username, password, phone, email, avatar }
const updateBody = { username, phone, email, avatar }

class UsersController extends Validator {
  constructor() {
    super(schema)
  }

  getUserByPhone = asyncError(async (req, res, next) => {
    const { phone } = req.params

    const user = await User.findOne({ where: { phone } })

    if (user) {
      const userData = user.toJSON()
      delete userData.password
      sucRes(res, 200, '取得用戶資料成功', userData)
    } else {
      sucRes(res, 200, `查無電話為${phone}的用戶`)
    }
  })

  putUserByPhone = asyncError(async (req, res, next) => {
    const { phone } = req.params

    // 驗證請求主體
    this.validateBody(req.body, passwordBody)
    const { password } = req.body

    const hashedPassword = await encrypt.hash(password)

    // 更新用戶密碼
    await User.update({ password: hashedPassword }, { where: { phone } })

    sucRes(res, 200, `使用電話 ${phone} 更新密碼成功.`)
  })

  putUserByEmail = asyncError(async (req, res, next) => {
    const { email } = req.params

    // 驗證請求主體
    this.validateBody(req.body, passwordBody)
    const { password } = req.body

    const hashedPassword = await encrypt.hash(password)

    // 更新用戶密碼
    await User.update({ password: hashedPassword }, { where: { email } })

    sucRes(res, 200, `使用信箱 ${email} 更新密碼成功.`)
  })

  getUsers = asyncError(async (req, res, next) => {
    const users = await User.findAll()

    sucRes(res, 200, '取得用戶資料成功', users)
  })

  getUser = asyncError(async (req, res, next) => {
    const { userId } = req.params

    const user = await User.findByPk(userId)

    // 驗證用戶是否存在
    this.validateData([user])

    // 刪除敏感資料
    const userData = user.toJSON()
    delete userData.password
    delete userData.refreshToken

    sucRes(res, 200, '取得用戶資料成功', userData)
  })

  postUser = asyncError(async (req, res, next) => {
    // 驗證請求主體
    this.validateBody(req.body, createBody)
    const { username, password, phone, email, avatar } = req.body

    const hashedPassword = await encrypt.hash(password)

    const user = await User.create({ username, password: hashedPassword, phone, email, avatar })

    const newUser = user.toJSON()
    delete newUser.password

    sucRes(res, 201, '由後臺新增用戶成功', newUser)
  })

  putUser = asyncError(async (req, res, next) => {
    const { userId } = req.params

    // 驗證請求主體
    this.validateBody(req.body, updateBody)
    const { username, phone, email, avatar } = req.body

    const user = await User.findByPk(userId)

    // 驗證用戶是否存在
    this.validateData([user])

    if (username !== user.username) {
      if (user.usernameModified) throw new CustomError(400, '帳號只能修改一次')
      await user.update({ username, usernameModified: true, phone, email, avatar })
    } else {
      await user.update({ phone, email, avatar })
    }

    sucRes(res, 200, `用戶ID ${userId} 資料更新成功`)
  })

  deleteUser = asyncError(async (req, res, next) => {
    const { userId } = req.params
    // 讀取單一資料
    const user = await User.findByPk(userId)
    // 驗證資料是否存在
    this.validateData([user])

    // 刪除User資訊
    await User.destroy({ where: { id: userId } })

    sucRes(res, 200, `用戶ID ${userId} 資料刪除成功`)
  })
}

module.exports = new UsersController()
