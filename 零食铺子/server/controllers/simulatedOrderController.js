const SimulatedOrder = require('../models/simulatedPaymentModel')
const AppError = require('../utils/errors')
const { success } = require('../utils/response')

// POST /api/order/create
// 创建一笔模拟支付订单：保存商品、金额（分）、用户、订单号，初始状态为 unpaid。
async function create(req, res) {
  const body = req.body || {}
  if (!Array.isArray(body.items) || !body.items.length) {
    throw new AppError('items is required', 400, 400)
  }
  if (body.totalFee === undefined && body.total_fee === undefined) {
    throw new AppError('totalFee is required and must use cents', 400, 400)
  }

  const bodyUserId = body.userId || body.user_id
  const tokenUserId = req.user && req.user.userId
  if (bodyUserId && Number(bodyUserId) !== Number(tokenUserId) && req.user.role !== 'admin') {
    throw new AppError('forbidden userId', 403, 403)
  }

  const userId = req.user.role === 'admin' && bodyUserId ? bodyUserId : tokenUserId
  if (!userId) {
    throw new AppError('userId is required', 400, 400)
  }

  const orderNo = await SimulatedOrder.create({
    ...body,
    userId
  })
  const order = await SimulatedOrder.findByOrderNo(orderNo)

  return success(res, {
    orderNo,
    order
  })
}

// GET /api/order/:orderNo
// 查询模拟支付订单状态：返回 unpaid / paid / cancelled 等当前状态。
async function detail(req, res) {
  const order = await SimulatedOrder.findByOrderNo(req.params.orderNo)
  if (!order) {
    throw new AppError('order not found', 404, 404)
  }
  return success(res, order)
}

module.exports = {
  create,
  detail
}
