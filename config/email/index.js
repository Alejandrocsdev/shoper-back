// 引用發送郵件模組
const nodemailer = require('nodemailer')
// 引用客製化錯誤訊息模組
const CustomError = require('../../errors/CustomError')
// 引用 Node.js 內建 File System 模組
const fs = require('fs')
// 引用 Node.js 內建 Path 模組
const path = require('path')

// 郵件傳送器設定
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

// 郵件樣板路徑
const textTemplatePath = path.resolve(__dirname, 'template.txt')
const htmlTemplatePath = path.resolve(__dirname, 'template.html')
// 郵件樣板
const textTemplate = fs.readFileSync(textTemplatePath, 'utf8')
const htmlTemplate = fs.readFileSync(htmlTemplatePath, 'utf8')

// 郵件選項
const options = (email, username, link) => {
  // 郵件內容
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

// 發送郵件函式
async function sendMail(email, username, link) {
  // 郵件傳送器驗證
  const auth = config.auth

  // 驗證傳送器信箱
  if (!auth.user || !auth.user.includes('@gmail.com')) {
    throw new CustomError(500, '缺少郵件傳送器信箱')
  }
  // 驗證傳送器密碼
  if (!auth.pass || auth.pass.length !== 16) {
    throw new CustomError(500, '缺少郵件傳送器密碼(App Password)')
  }

  // 郵件傳送器
  const transporter = nodemailer.createTransport(config)

  try {
    await transporter.sendMail(options(email, username, link))
  } catch (err) {
    throw new CustomError(500, '郵件發送失敗 (gmail)')
  }
}

module.exports = sendMail
