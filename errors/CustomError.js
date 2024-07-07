// 客製化錯誤訊息模組
class CustomError extends Error {
  constructor(code, message) {
    // 覆蓋 Error 預設錯誤訊息
    super(message)
    // 增加 Error.code (狀態碼 + 狀態類型)
    this.code = code
  }
}

module.exports = CustomError
