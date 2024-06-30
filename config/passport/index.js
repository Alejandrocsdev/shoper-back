const passport = require('passport')

const localStrategy = require('./local')
const jwtStrategy = require('./jwt')

const jwtError = require('../../errors/jwtError')

passport.use(localStrategy)
passport.use(jwtStrategy)

const passportInit = passport.initialize()

const loginAuth = passport.authenticate('local', { session: false })

const jwtAuth = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (passportErr, user, info) => {
    const err = jwtError(passportErr, user, info)
    req.user = user
    next(err)
  })(req, res, next)
}

module.exports = { passportInit, loginAuth, jwtAuth }
