// err.errors(O)
// SequelizeUniqueConstraintError(unique violation)
// SequelizeValidationError(notNull Violation)
// err.errors(X)
// SequelizeEagerLoadingError
// SequelizeDatabaseError
// SequelizeConnectionError
// SequelizeForeignKeyConstraintError
// SequelizeInstanceError
// AssertionError

// 自定義Sequelize錯誤訊息
function sequelizeError(err) {
  // 如Sequelize錯誤含errors(細節資訊)
  if (err.errors) {
    const name = err.name
    const field = err.errors[0].path
    const value = err.errors[0].value
    return clientError(name, field, value)
  } else {
    return { code: 500, message: 'Database or ORM Error' }
  }
}

// 客戶端錯誤
function clientError(name, field, value) {
  if (name === 'SequelizeUniqueConstraintError') {
    return { code: 409, message: `欄位 '${field}' 的值 '${value}' 已存在。` }
  } else if (name === 'SequelizeValidationError') {
    return { code: 400, message: `欄位 '${field}' 不能為空(null)。` }
  } else {
    // 不明錯誤
    return { code: 400, message: '不明客戶端錯誤 (Sequelize)' }
  }
}

module.exports = sequelizeError
