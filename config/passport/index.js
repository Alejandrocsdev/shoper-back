const passport = require('passport')

const localStrategy = require('./local')
const smsStrategy = require('./sms')
const jwtStrategy = require('./jwt')

passport.use('local', localStrategy)
passport.use('sms', smsStrategy)
passport.use('jwt', jwtStrategy)

const passportInit = passport.initialize()

const pwdSignInAuth = passport.authenticate('local', { session: false })
const smsSignInAuth = passport.authenticate('sms', { session: false })
const jwtAuth = passport.authenticate('jwt', { session: false })

module.exports = { passportInit, pwdSignInAuth, smsSignInAuth, jwtAuth }

// const jwtError = require('../../errors/jwtError')

// const jwtAuth = (req, res, next) => {
//   passport.authenticate('jwt', { session: false }, (passportErr, user, info) => {
//     const err = jwtError(passportErr, user, info)
//     // req.user = user
//     next(err)
//   })(req, res, next)
// }


