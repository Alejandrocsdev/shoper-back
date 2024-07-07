// 包含細節錯誤: err.errors(O)
// SequelizeUniqueConstraintError(unique violation)
// SequelizeValidationError(notNull Violation)

// 不含細節錯誤: err.errors(X)
// SequelizeEagerLoadingError
// SequelizeDatabaseError
// SequelizeConnectionError
// SequelizeForeignKeyConstraintError
// SequelizeInstanceError
// AssertionError

// 客製化 Sequelize 錯誤訊息模組
function sequelizeError(err) {
  // 如 Sequelize 錯誤包含細節資訊 (errors)
  if (err.errors) {
    // 錯誤類型
    const name = err.name
    // 欄位名稱
    const field = err.errors[0].path
    // 欄位資料
    const value = err.errors[0].value
    // 客戶端錯誤
    return clientError(name, field, value)
  } 
  // 如 Sequelize 錯誤不含細節資訊 (errors)
  else {
    // 回傳通用錯誤訊息: 資料庫 / ORM 錯誤
    return { code: 500, message: 'Database or ORM Error' }
  }
}

// 客戶端錯誤
function clientError(name, field, value) {
  if (name === 'SequelizeUniqueConstraintError') {
    return { code: 409, message: `欄位 '${field}' 的值 '${value}' 已存在。` }
  } else if (name === 'SequelizeValidationError') {
    return { code: 400, message: `欄位 '${field}' 不可為空 (null)。` }
  } else {
    // 不明錯誤
    return { code: 400, message: '不明錯誤 (Sequelize)' }
  }
}

module.exports = sequelizeError
