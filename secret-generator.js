const encrypt = require('./utils/encrypt')
const secret = encrypt.secret()
const a = async () => {
  const b = await encrypt.hash('Santoro319988')
  console.log(b)
}
a()
// 生成環境變數所需SECRET
console.log(secret)
