const { errRes } = require('../utils/customResponse')

const { BaseError } = require('sequelize')

const sequelizeError = require('../errors/sequelizeError')

const CustomError = require('../errors/CustomError')

function globalError(err, req, res, next) {
  const backEndMsg = err.message
  if (err instanceof BaseError) {
    const { code, message } = sequelizeError(err)
    err.code = code
    err.message = message
  } else if (!(err instanceof CustomError)) {
    err.code = 500
    err.message = 'Programming Error'
  }

  const message = { frontEndMsg: err.message, backEndMsg }

  errRes(res, err.code, message, err.name)
}

module.exports = globalError
