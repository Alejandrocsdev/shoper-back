const CustomError = require('../errors/CustomError')

class Validator {
  constructor(schema) {
    this.schema = schema
  }

  joiMessage(error) {
    let message = error.details[0].message
    message = message.replace(/\"/g, '')
    message = message.charAt(0).toUpperCase() + message.slice(1)
    return message
  }

  validateBody(payload, body) {
    const schema = body ? this.schema.append(body) : this.schema
    const { error } = schema.validate(payload)

    if (error) {
      const message = this.joiMessage(error)
      throw new CustomError(400, message)
    }
  }

  validateImage(file, schema) {
    const { error } = schema.validate(file)
  
    if (error) {
      const message = this.joiMessage(error)
      throw new CustomError(400, message)
    }
  }

  validateData(datas, message) {
    datas.forEach((data) => {
      if (!data) {
        throw new CustomError(404, message || 'Table data not found with parameter or body id.')
      }
    })
  }

  validatePreserved(data, preserved) {
    if (data === preserved) {
      throw new CustomError(400, `Value '${preserved}' is a preserved field, cannot be alter.`)
    }
  }
}

module.exports = Validator
