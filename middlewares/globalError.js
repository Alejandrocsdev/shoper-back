// 引用錯誤回應模組
const { errRes } = require('../utils/customResponse')
// 引用Sequelize錯誤class
const { BaseError } = require('sequelize')
// 引用自定義Sequelize錯誤訊息模組
const sequelizeError = require('../errors/sequelizeError')
// 自定義錯誤訊息
const CustomError = require('../errors/CustomError')

// 全域錯誤中間件
function globalError(err, req, res, next) {
  // 後端回應訊息
  const backEndMsg = err.message

  // 篩選錯誤類別
  if (err instanceof BaseError) {
    // Sequelize錯誤
    const { code, message } = sequelizeError(err)
    err.code = code
    err.message = message
  } else if (!(err instanceof CustomError)) {
    // 自定義錯誤
    err.code = 500
    err.message = 'Programming Error'
  }

  // 其他則是Error Class錯誤

  const message = { frontEndMsg: err.message, backEndMsg }

  errRes(res, err.code, message, err.name)
}

module.exports = globalError
