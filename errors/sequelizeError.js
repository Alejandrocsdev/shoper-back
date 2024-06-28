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

function sequelizeError(err) {
  if (err.errors) {
    const name = err.name
    const field = err.errors[0].path
    const value = err.errors[0].value
    return clientError(name, field, value)
  } else {
    return { code: 500, message: 'Database or ORM Error' }
  }
}

function clientError(name, field, value) {
  if (name === 'SequelizeUniqueConstraintError') {
    return { code: 409, message: `The value '${value}' for the field '${field}' already exists.` }
  } else if (name === 'SequelizeValidationError') {
    return { code: 400, message: `Field '${field}' cannot be null.` }
  } else {
    return { code: 400, message: 'Unspecified Client Error (Sequelize)' }
  }
}

module.exports = sequelizeError
