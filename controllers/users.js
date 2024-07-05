// 引用Sequelize Model
const { User } = require('../models')
// 異步錯誤中間件
const { asyncError } = require('../middlewares')
// 成功回應
const { sucRes } = require('../utils/customResponse')
// 驗證Class
const Validator = require('../Validator')
// 驗證模組
const Joi = require('joi')

// 加密模組
const bcrypt = require('bcryptjs')
const encrypt = require('../utils/encrypt')
const srp = require('secure-random-password')

class UsersController extends Validator {
  getUsers = asyncError(async (req, res, next) => {
    const users = await User.findAll()

    sucRes(res, 200, '取得用戶資料成功', users)
  })

  getUserById = asyncError(async (req, res, next) => {
    const { userId } = req.params

    const user = await User.findByPk(userId)

    const userData = user.toJSON()
    delete userData.password
    sucRes(res, 200, '取得用戶資料成功', userData)
  })

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

  putUser = asyncError(async (req, res, next) => {
    // 請求參數(checkId中間件已驗證過)
    const { userId } = req.params

    // 更新User資訊
    await User.update({ email }, { where: { id: userId } })

    sucRes(res, 200, `Updated table data with id ${userId} successfully.`)
  })

  putUserByPhone = asyncError(async (req, res, next) => {
    // 請求參數(checkId中間件已驗證過)
    const { phone } = req.params
    const { password } = req.body

    const hashedPassword = await bcrypt.hash(password, 10)

    // 更新User資訊
    await User.update({ password: hashedPassword }, { where: { phone } })

    sucRes(res, 200, `使用電話 ${phone} 更新密碼成功.`)
  })

  putUserByEmail = asyncError(async (req, res, next) => {
    // 請求參數(checkId中間件已驗證過)
    const { email } = req.params
    const { password } = req.body

    const hashedPassword = await bcrypt.hash(password, 10)

    // 更新User資訊
    await User.update({ password: hashedPassword }, { where: { email } })

    sucRes(res, 200, `使用信箱 ${email} 更新密碼成功.`)
  })

  signUp = asyncError(async (req, res, next) => {
    const { phone, password } = req.body

    const hashedPassword = await bcrypt.hash(password, 10)
    const username = srp.randomPassword({
      length: 10,
      characters: srp.digits + srp.lower + srp.upper + srp.symbols
    })

    const user = await User.create({ username, password: hashedPassword, phone })

    const newUser = user.toJSON()
    delete newUser.password

    sucRes(res, 201, '新用戶註冊成功', newUser)
  })

  signIn = asyncError(async (req, res, next) => {
    const { user } = req
    if (!user) throw new CustomError(401, '登入失敗')

    const token = encrypt.signToken(user.id, '1d')
    delete user.password

    res.cookie('jwt', token.value, {
      maxAge: 1 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production'
    })

    sucRes(res, 200, '登入成功', user)
  })

  autoSignIn = asyncError(async (req, res, next) => {
    const { userId } = req.params

    const token = encrypt.signToken(userId, '1d')
    const user = await User.findByPk(userId)
    const userData = user.toJSON()
    delete userData.password

    res.cookie('jwt', token.value, {
      maxAge: 1 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production'
    })

    sucRes(res, 200, '登入成功', userData)
  })
}

module.exports = new UsersController()
