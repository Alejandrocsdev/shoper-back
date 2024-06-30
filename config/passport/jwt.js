const { Strategy, ExtractJwt } = require('passport-jwt')
const { User } = require('../../models')
const CustomError = require('../../errors/CustomError')

const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.ACCESS_TOKEN_SECRET
}

const verifyCallback = async (payload, cb) => {
  try {
    let user = await User.findByPk(payload.id)
    if (!user) throw new CustomError(404, 'User not found')
    user = user.toJSON()
    delete user.password
    return cb(null, user)
  } catch (err) {
    return cb(err)
  }
}

const jwtStrategy = new Strategy(options, verifyCallback)

module.exports = jwtStrategy
