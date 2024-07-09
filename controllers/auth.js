// 引用 Models
const { User, Role } = require('../models')
// 引用異步錯誤處理中間件
const { asyncError } = require('../middlewares')
// 引用 成功回應 / 加密 / Cookie 模組
const { sucRes, encrypt, cookie } = require('../utils')
// 引用自定義驗證模組
const Validator = require('../Validator')
// 引用驗證模組
const Joi = require('joi')
// 客製化錯誤訊息模組
const CustomError = require('../errors/CustomError')
// Body驗證條件(base)
const schema = Joi.object({
  phone: Joi.string().pattern(/^09/).length(10).required(),
  password: Joi.string()
    .min(8)
    .max(16)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/)
    .required()
})

class AuthController extends Validator {
  constructor() {
    super(schema)
  }

  token = asyncError(async (req, res, next) => {
    const cookies = req.cookies
    if (!cookies?.jwt) throw new CustomError(401, '查無刷新憑證')

    const rt = cookies.jwt

    const user = await User.findOne({
      where: { refreshToken: rt },
      include: [{ model: Role, as: 'roles', attributes: ['name'] }]
    })
    const { id } = encrypt.verifyToken(rt, 'RT')

    if (!user || id !== user.id) throw new CustomError(403, '存取憑證刷新失敗')

    const at = encrypt.signAccessToken(id, user.roles)
    const newRt = encrypt.signRefreshToken(id)

    await User.update({ refreshToken: newRt }, { where: { id } })

    cookie.store(res, newRt)

    sucRes(res, 200, '存取憑證刷新成功', at)
  })

  autoSignIn = asyncError(async (req, res, next) => {
    const { userId } = req.params

    const user = await User.findByPk(userId, {
      include: [{ model: Role, as: 'roles', attributes: ['name'] }]
    })

    // 驗證用戶是否存在
    this.validateData([user])

    const at = encrypt.signAccessToken(userId, user.roles)
    const rt = encrypt.signRefreshToken(userId)

    await User.update({ refreshToken: rt }, { where: { id: userId } })

    cookie.store(res, rt)

    sucRes(res, 200, '登入成功', at)
  })

  signIn = asyncError(async (req, res, next) => {
    const { user } = req
    if (!user) throw new CustomError(401, '登入失敗')

    const at = encrypt.signAccessToken(user.id, user.roles)
    const rt = encrypt.signRefreshToken(user.id)

    await User.update({ refreshToken: rt }, { where: { id: user.id } })

    cookie.store(res, rt)

    sucRes(res, 200, '登入成功', at)
  })

  signUp = asyncError(async (req, res, next) => {
    // 驗證請求主體
    this.validateBody(req.body)
    const { phone, password } = req.body

    const hashedPassword = await encrypt.hash(password)

    // 生成唯一帳號
    const username = await encrypt.uniqueUsername(User)

    const [user, userRole] = await Promise.all([
      User.create({ username, password: hashedPassword, phone }),
      Role.findOne({ where: { name: 'user' } })
    ])

    console.log(userRole)
    const a = userRole.toJSON()
    console.log(a)

    // 驗證用戶是否存在
    this.validateData([userRole], '查無角色')

    await user.addRoles([userRole])

    const newUser = user.toJSON()
    delete newUser.password

    sucRes(res, 201, '新用戶註冊成功', newUser)
  })

  signOut = asyncError(async (req, res, next) => {
    const cookies = req.cookies
    if (!cookies?.jwt) return res.sendSatus(204)

    const rt = cookies.jwt
    const user = await User.findOne({ where: { refreshToken: rt } })

    cookie.clear(res)

    if (!user) {
      res.sendSatus(204)
    } else {
      await User.update({ refreshToken: null }, { where: { id: user.id } })
      sucRes(res, 200, '登出成功')
    }
  })
}

module.exports = new AuthController()
