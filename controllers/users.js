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
}

module.exports = new UsersController()
