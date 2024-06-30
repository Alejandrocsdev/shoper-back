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

// Body驗證條件(base)
const schema = Joi.object({
  password: Joi.string()
    .min(8)
    .max(16)
    .pattern(/(?=.*[a-z])(?=.*[A-Z])/)
    .required(),
  phone: Joi.string().pattern(/^09/).length(10).required()
})

class UsersController extends Validator {
  constructor() {
    super(schema)
  }

  signUp = asyncError(async (req, res, next) => {
    // 驗證請求主體
    this.validateBody(req.body)
    const { password, phone } = req.body

    const hashedPassword = await bcrypt.hash(password, 10)

    const username = srp.randomPassword({
      length: 10,
      characters: srp.digits + srp.lower + srp.upper + srp.symbols
    })

    const user = await User.create({ username, password: hashedPassword, phone })

    const newUser = user.toJSON()
    delete newUser.password

    sucRes(res, 201, `New user signed up successfully.`, newUser)
  })

  signIn = asyncError(async (req, res, next) => {
    const user = req.user.toJSON()
    console.log(req.user)
    const token = encrypt.signToken(user.id, '1d')
    delete user.password

    console.log(token)

    res.cookie('jwt', token.value, {
      maxAge: 1 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production'
    })

    sucRes(res, 200, 'Sign In successfully.', user)
  })
}

module.exports = new UsersController()
