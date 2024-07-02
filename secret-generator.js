const encrypt = require('./utils/encrypt')
const secret = encrypt.secret()

// 生成環境變數所需SECRET
console.log(secret)
