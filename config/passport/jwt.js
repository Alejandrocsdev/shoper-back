// 引用 Passport-JWT 模組
const { Strategy, ExtractJwt } = require('passport-jwt')
// 引用 Models
const { User, Role } = require('../../models')
// 引用客製化錯誤訊息模組
const CustomError = require('../../errors/CustomError')

// JWT 策略選項
const options = {
  // 從 Authorization 標頭中提取 JWT
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  // 設定 JWT 的密鑰
  secretOrKey: process.env.AT_SECRET
}

// 驗證函式
const verifyCallback = async (payload, cb) => {
  try {
    // 根據 JWT payload 中的 user ID 查找使用者，並包括其角色資訊
    const user = await User.findByPk(payload.userInfo.id, {
      include: [{ model: Role, as: 'roles', attributes: ['name'] }]
    })
    if (!user) throw new CustomError(404, '查無用戶')

    // 取得使用者的角色名稱列表
    const roles = user.roles.map((role) => role.name)
    if (!roles) throw new CustomError(403, '權限不足')

    // 刪除敏感資料
    const authUser = user.toJSON()
    delete authUser.password

    // 傳遞驗證成功的用戶資料
    cb(null, authUser)
  } catch (err) {
    // 傳遞錯誤
    cb(err)
  }
}

// 定義 JWT 策略
const jwtStrategy = new Strategy(options, verifyCallback)

module.exports = jwtStrategy
