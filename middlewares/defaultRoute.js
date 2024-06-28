// 自定義錯誤訊息
const CustomError = require('../errors/CustomError')

// 預設路由中間件
function defaultRoute(req, res, next) {
  const err = new CustomError(404, `伺服器端查無 ${req.originalUrl} 路由`)
  next(err)
}

module.exports = defaultRoute
