// 引用錯誤回應模組
const { errRes } = require('../utils')
// 引用 Sequelize 錯誤模組
const { BaseError } = require('sequelize')
// 引用 Sequelize 錯誤訊息模組
const sequelizeError = require('../errors/sequelizeError')
// 引用客製化錯誤訊息模組
const CustomError = require('../errors/CustomError')

// 全域錯誤訊息中間件
function globalError(err, req, res, next) {
  // 後端回應錯誤訊息
  const backEndMsg = { err, message: err.message }

  // 篩選錯誤類別
  if (err instanceof BaseError) {
    // Sequelize 錯誤
    const { code, message } = sequelizeError(err)
    err.code = code
    err.message = message
  } else if (!(err instanceof CustomError)) {
    // 自定義錯誤(後端其他錯誤)
    err.code = 500
    err.message = 'Programming Error'
  }

  // 其他則是 Error 錯誤

  const message = { frontEndMsg: err.message, backEndMsg }

  errRes(res, err.code, message, err.name)
}

module.exports = globalError
