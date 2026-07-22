const express = require('express')
const controller = require('../controllers/orderController')
const asyncHandler = require('../utils/asyncHandler')
const auth = require('../middleware/auth')

const router = express.Router()

router.post('/', auth, asyncHandler(controller.create))
router.get('/detail/:id', auth, asyncHandler(controller.detail))
router.get('/:userId', auth, asyncHandler(controller.listByUser))
router.put('/:id/cancel', auth, asyncHandler(controller.cancel))

module.exports = router
