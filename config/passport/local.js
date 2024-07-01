const { Strategy } = require('passport-local')
const customFields = { usernameField: 'loginKey', passwordField: 'password' }

const { User } = require('../../models')
const encrypt = require('../../utils/encrypt')
const CustomError = require('../../errors/CustomError')

const verifyCallback = async (loginKey, password, cb) => {
  console.log(loginKey)
  console.log(password)
  const a = await User.findAll()
  console.log(a)
  try {
    const results = await Promise.all([
      User.findOne({ where: { email: loginKey } }),
      User.findOne({ where: { phone: loginKey } }),
      User.findOne({ where: { username: loginKey } })
    ])
    const user = results.find((result) => result !== null)
    console.log(results)
    console.log(user)
    if (!user) throw new CustomError(404, 'Login Key not found.')
    const match = await encrypt.hashCompare(password, user.password)
    if (!match) throw new CustomError(401, 'Password incorrect.')
    cb(null, user)
  } catch (err) {
    cb(err)
  }
}

const localStrategy = new Strategy(customFields, verifyCallback)

module.exports = localStrategy
