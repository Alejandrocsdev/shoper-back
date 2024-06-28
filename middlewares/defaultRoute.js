const CustomError = require('../errors/CustomError')

function defaultRoute(req, res, next) {
  const err = new CustomError(404, `Can't find ${req.originalUrl} on the server.`)
  next(err)
}

module.exports = defaultRoute
