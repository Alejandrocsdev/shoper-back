// 引用客製化錯誤訊息模組
const CustomError = require('../errors/CustomError')

class Validator {
  constructor(schema) {
    this.schema = schema
  }

  // 客製化調整Joi預設驗證錯誤訊息格式
  joiMessage(error) {
    let message = error.details[0].message
    message = message.replace(/\"/g, '')
    message = message.charAt(0).toUpperCase() + message.slice(1)
    return message
  }

  // 驗證請求主體
  validateBody(payload, body) {
    // 額外Schema處理
    const schema = body ? this.schema.append(body) : this.schema
    // 驗證錯誤
    const { error } = schema.validate(payload)

    if (error) {
      const message = this.joiMessage(error)
      throw new CustomError(400, message)
    }
  }

  // 驗證(多筆)資料是否存在
  validateData(datas, message) {
    datas.forEach((data) => {
      if (!data) {
        throw new CustomError(404, message || '查無具有該參數ID或主體的表格資料。')
      }
    })
  }
}

module.exports = Validator
