const express = require('express')
const controller = require('../controllers/simulatedOrderController')
const asyncHandler = require('../utils/asyncHandler')
const auth = require('../middleware/auth')

const router = express.Router()

// 创建模拟支付订单，返回唯一订单号。
router.post('/create', auth, asyncHandler(controller.create))

// 按订单号查询订单状态和订单详情。
router.get('/:orderNo', auth, asyncHandler(controller.detail))

module.exports = router
