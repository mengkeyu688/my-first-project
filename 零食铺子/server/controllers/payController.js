const SimulatedOrder = require('../models/simulatedPaymentModel')
const AppError = require('../utils/errors')
const { success } = require('../utils/response')

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// POST /api/pay/simulate
// 模拟支付请求：等待约 1 秒后返回结果。成功时只允许 unpaid 订单第一次变为 paid。
async function simulate(req, res) {
  const { orderNo, result } = req.body || {}
  if (!orderNo) {
    throw new AppError('orderNo is required', 400, 400)
  }

  await delay(1000)

  if (result === 'fail') {
    throw new AppError('支付失败，请稍后重试', 400, 400)
  }

  if (result === 'cancel') {
    await SimulatedOrder.cancel(orderNo)
    return success(res, {
      orderNo,
      status: 'cancelled',
      message: '用户取消支付'
    })
  }

  const payment = await SimulatedOrder.markPaid(orderNo)
  const order = await SimulatedOrder.findByOrderNo(orderNo)

  return success(res, {
    orderNo,
    status: payment.status,
    repeated: payment.repeated,
    message: payment.repeated ? '订单已支付' : '支付成功',
    order
  })
}

module.exports = {
  simulate
}
