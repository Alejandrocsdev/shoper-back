// info(O)
// TokenExpiredError
// JsonWebTokenError

const CustomError = require('../errors/CustomError')

function jwtError(passportErr, user, info) {
  console.log(passportErr)
  if (info && info.name === 'TokenExpiredError') {
    return new CustomError(401, `Token expired, expired at ${info.expiredAt}`)
  } else if (info && info.name === 'JsonWebTokenError') {
    return new CustomError(401, 'Invalid token')
  }

  if (passportErr || !user) return new CustomError(401, 'Unauthorized')
}

module.exports = jwtError
