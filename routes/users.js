const { Router } = require('express')
const router = Router()

const { usersController } = require('../controllers')

const { checkId } = require('../middlewares')

const { jwtAuth } = require('../config/passport')

// 驗證參數 userId
router.param('userId', checkId)

router.route('/phone/:phone')
  .get(usersController.getUserByPhone)
  .put(usersController.putUserByPhone)

router.route('/email/:email')
  .put(usersController.putUserByEmail)

router.route('/:userId')
  .get(jwtAuth, usersController.getUser)
  .put(jwtAuth, usersController.putUser)
  .delete(jwtAuth, usersController.deleteUser)

router.route('/')
  .get(jwtAuth, usersController.getUsers)
  .post(jwtAuth, usersController.postUser)

module.exports = router
