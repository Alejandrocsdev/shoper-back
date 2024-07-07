// 引用 Passport 模組
const passport = require('passport')

// 策略
const localStrategy = require('./local')
const smsStrategy = require('./sms')
const jwtStrategy = require('./jwt')

// 使用策略
passport.use('local', localStrategy)
passport.use('sms', smsStrategy)
passport.use('jwt', jwtStrategy)

// 定義 Passport 初始化
const passportInit = passport.initialize()

// 定義中間件: 密碼登入驗證 / 簡訊登入驗證 / 憑證驗證
const pwdSignInAuth = passport.authenticate('local', { session: false })
const smsSignInAuth = passport.authenticate('sms', { session: false })
const jwtAuth = passport.authenticate('jwt', { session: false })

module.exports = { passportInit, pwdSignInAuth, smsSignInAuth, jwtAuth }
