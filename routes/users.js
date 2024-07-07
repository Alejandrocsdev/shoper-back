const { Router } = require('express')
const router = Router()

const { usersController } = require('../controllers')

const { checkId, checkRoles } = require('../middlewares')

const { jwtAuth } = require('../config/passport')

// 驗證參數 userId
router.param('userId', checkId)

router.route('/phone/:phone')
  .get(usersController.getUserByPhone)
  .put(usersController.putUserByPhone)

router.route('/email/:email')
  .put(usersController.putUserByEmail)

router.route('/:userId')
  .get(jwtAuth, checkRoles('admin', 'viewer', 'user'), usersController.getUser)
  .put(jwtAuth, checkRoles('admin', 'user'), usersController.putUser)
  .delete(jwtAuth, checkRoles('admin'), usersController.deleteUser)

router.route('/')
  .get(jwtAuth, checkRoles('admin', 'viewer', 'user'), usersController.getUsers)
  .post(jwtAuth, checkRoles('admin'), usersController.postUser)

module.exports = router
