// 引入發送信件模組
const nodemailer = require('nodemailer')

// 自定義錯誤訊息
const CustomError = require('../../errors/CustomError')

const fs = require('fs')
const path = require('path')

const textTemplatePath = path.resolve(__dirname, 'template.txt')
const htmlTemplatePath = path.resolve(__dirname, 'template.html')

const textTemplate = fs.readFileSync(textTemplatePath, 'utf8')
const htmlTemplate = fs.readFileSync(htmlTemplatePath, 'utf8')

// 設置郵件服務器配置
const config = {
  service: process.env.EMAIL_SERVICE,
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: Number(process.env.EMAIL_PORT) === 465 ? true : false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
}

// 信件選項
const options = (email, username, link) => {
  const textEmailContent = textTemplate.replace('{{username}}', username).replace('{{link}}', link)
  const htmlEmailContent = htmlTemplate.replace('{{username}}', username).replace('{{link}}', link)

  return {
    from: process.env.EMAIL_USER,
    to: email,
    subject: '重設您的瞎皮爾購物密碼',
    // text & html 擇一渲染(html優先)
    text: textEmailContent,
    html: htmlEmailContent
  }
}

// 發送信件函式
async function sendMail(email, username, link) {
  // 郵件傳送器驗證
  const auth = config.auth

  // 驗證傳送器信箱
  if (!auth.user || !auth.user.includes('@gmail.com')) {
    throw new CustomError(500, '缺少郵件服務器信箱')
  }

  // 驗證傳送器密碼
  if (!auth.pass || auth.pass.length !== 16) {
    throw new CustomError(500, '缺少郵件服務器密碼(App Password)')
  }

  // 創建可重複使用的發送郵件對象
  const transporter = nodemailer.createTransport(config)

  try {
    const info = await transporter.sendMail(options(email, username, link))
  } catch (err) {
    throw new CustomError(500, '信箱發送失敗 (gmail)')
  }
}

module.exports = sendMail
