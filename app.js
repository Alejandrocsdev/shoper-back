// 引用環境變數模組
require('dotenv').config()
// 引用後端框架
const express = require('express')
// 建立 Express 應用程式
const app = express()
// 伺服器端口
const port = process.env.PORT
// 引用cors中間件
const cors = require('cors')
// 引用路由模組
const routes = require('./routes')
// 引用自定義中間件(預設路由/全域錯誤)
const { defaultRoute, globalError } = require('./middlewares')
// 中間件: 跨來源資源共用
app.use(cors())
// Express中間件: 解析請求主體的 JSON 格式資料
app.use(express.json())
// 掛載路由中間件
app.use('/api', routes)
// 掛載預設路由中間件
app.all('*', defaultRoute)
// 掛載全域錯誤中間件
app.use(globalError)
// 監聽伺服器運行
app.listen(port, () => console.info(`Express server running on port: ${port}`))
