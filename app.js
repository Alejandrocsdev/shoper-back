// 引用環境變數模組
require('dotenv').config()
// 引用後端框架
const express = require('express')
// 建立 Express 應用程式
const app = express()
// 伺服器端口
const port = process.env.PORT
// 引用 CORS 中間件
const cors = require('cors')
// 設定 CORS 的選項，允許來自特定來源的請求，並且允許攜帶憑證
const corsOptions = {
  origin: [
    'http://localhost:5173',
    'https://newlean14.com',
    'https://www.newlean14.com',
    'https://shoper-front.onrender.com',
    'http://localhost:3000',
    'https://mqzcuyfbct.ap-northeast-1.awsapprunner.com'
  ],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
  credentials: true
}

// 引用 Cookie-Parser 中間件
const cookieParser = require('cookie-parser')
// 引用 Passport 初始化模組
const { passportInit } = require('./config/passport')
// 引用路由模組
const routes = require('./routes')
// 引用自定義中間件(預設路由/全域錯誤)
const { defaultRoute, globalError } = require('./middlewares')
// Express 中間件: 解析請求主體的 URL 編碼格式資料 (不使用擴展模式)
app.use(express.urlencoded({ extended: false }))
// Express 中間件: 解析請求主體的 JSON 格式資料
app.use(express.json())
// 中間件: 跨來源資源共用
app.use(cors(corsOptions))
// 中間件: 解析 Cookie
app.use(cookieParser())
// 初始化 Passport
app.use(passportInit)
// 掛載路由中間件
app.use('/api', routes)
// 掛載預設路由中間件
app.all('*', defaultRoute)
// 掛載全域錯誤中間件
app.use(globalError)
// 監聽伺服器運行
app.listen(port, () => console.info(`Express server running on port: ${port}`))
