// 引用客製化錯誤訊息模組
const CustomError = require('../errors/CustomError')

// 角色驗證中間件
function checkRoles(...roles) {
  return (req, res, next) => {
    if (!req.user?.roles) throw new CustomError(404, '查無角色')

    const rolesArray = [...roles]

    const allowed = req.user.roles.some((role) => rolesArray.includes(role))
    if (!allowed) throw new CustomError(403, '權限不足')

    next()
  }
}

module.exports = checkRoles
