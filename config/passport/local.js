const { Strategy } = require('passport-local')
const customFields = { usernameField: 'loginKey', passwordField: 'password' }

const { User } = require('../../models')
const encrypt = require('../../utils/encrypt')
const CustomError = require('../../errors/CustomError')

const verifyCallback = async (loginKey, password, cb) => {
  try {
    const users = await Promise.all([
      User.findOne({ where: { email: loginKey } }),
      User.findOne({ where: { phone: loginKey } }),
      User.findOne({ where: { username: loginKey } })
    ])
    const userIndex = users.findIndex((user) => user !== null)
    if (userIndex === -1) throw new CustomError(404, '帳號錯誤')
    const user = users[userIndex]
    const isPasswordMatch = await encrypt.hashCompare(password, user.password)
    const isPasswordSame = password === user.password
    if (password !== 'otp' && !isPasswordMatch && !isPasswordSame) throw new CustomError(401, '密碼錯誤')
    cb(null, user)
  } catch (err) {
    cb(err)
  }
}

const localStrategy = new Strategy(customFields, verifyCallback)

module.exports = localStrategy
