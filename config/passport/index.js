// 引用 Passport 模組
const passport = require('passport')

// 引用 Models
const { User } = require('../../models')
// 引用 加密 / Cookie 模組
const { encrypt, cookie } = require('../../utils')

// 策略
const localStrategy = require('./local')
const smsStrategy = require('./sms')
const facebookStrategy = require('./facebook')
const jwtStrategy = require('./jwt')

// 使用策略
passport.use('local', localStrategy)
passport.use('sms', smsStrategy)
passport.use('facebook', facebookStrategy)
passport.use('jwt', jwtStrategy)

// Passport 初始化
const passportInit = passport.initialize()

// 密碼登入驗證 / 簡訊登入驗證
const pwdSignInAuth = passport.authenticate('local', { session: false })
const smsSignInAuth = passport.authenticate('sms', { session: false })

// 臉書登入驗證 / 臉書登入導向
const fbSignInAuth = passport.authenticate('facebook', { scope: ['email'] })
const fbCallback = (req, res, next) => {
  passport.authenticate('facebook', async (err, user, info) => {
    if (err || !user) {
      return res.redirect('https://shoper-a5881.web.app?facebook-verified=false')
    }

    const at = encrypt.signAccessToken(user.id)
    const rt = encrypt.signRefreshToken(user.id)

    await User.update({ refreshToken: rt }, { where: { id: user.id } })

    cookie.store(res, rt)

    res.redirect(`https://shoper-a5881.web.app?access_token=${at}`)
  })(req, res, next)
}

// 憑證驗證
const jwtAuth = passport.authenticate('jwt', { session: false })

module.exports = { passportInit, pwdSignInAuth, smsSignInAuth, fbSignInAuth, fbCallback, jwtAuth }
