const express = require('express')
const controller = require('../controllers/payController')
const asyncHandler = require('../utils/asyncHandler')
const auth = require('../middleware/auth')

const router = express.Router()

// 发起模拟支付，可传 result=success/fail/cancel，默认 success。
router.post('/simulate', auth, asyncHandler(controller.simulate))

module.exports = router
