const express = require('express')
function routes(controller, writeLimit) {
  const router = express.Router()
  router.get('/stats', controller.stats)
  router.get('/games', controller.list)
  router.get('/games/:id', controller.get)
  router.post('/games', writeLimit, controller.create)
  router.patch('/games/:id', writeLimit, controller.update)
  router.delete('/games/:id', writeLimit, controller.remove)
  router.post('/demo/reset', writeLimit, controller.reset)
  return router
}
module.exports = { routes }
