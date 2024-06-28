// 自定義錯誤訊息
class CustomError extends Error {
  constructor(code, message) {
    super(message)
    this.code = code
  }
}

module.exports = CustomError
