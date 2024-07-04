const { Strategy } = require('passport-local')

const { User } = require('../../models')

const encrypt = require('../../utils/encrypt')

const CustomError = require('../../errors/CustomError')

const customFields = { usernameField: 'loginKey', passwordField: 'password' }

const verifyCallback = async (loginKey, password, cb) => {
  try {
    const users = await Promise.all([
      User.findOne({ where: { email: loginKey } }),
      User.findOne({ where: { phone: loginKey } }),
      User.findOne({ where: { username: loginKey } })
    ])
    const userIndex = users.findIndex((user) => user !== null)
    if (userIndex === -1) throw new CustomError(404, '輸入資料錯誤')
    const user = users[userIndex]
    const match = await encrypt.hashCompare(password, user.password)
    if (!match) throw new CustomError(401, '輸入密碼錯誤')
    cb(null, user)
  } catch (err) {
    cb(err)
  }
}

const localStrategy = new Strategy(customFields, verifyCallback)

module.exports = localStrategy
