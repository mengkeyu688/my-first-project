const Order = require('../models/orderModel')
const AppError = require('../utils/errors')
const { success } = require('../utils/response')

async function create(req, res) {
  const body = req.body
  if (!body.items || !Array.isArray(body.items) || !body.items.length) {
    throw new AppError('items is required', 400, 400)
  }
  if (!body.building || !body.room || !body.phone) {
    throw new AppError('building, room and phone are required', 400, 400)
  }

  const orderId = await Order.create({
    userId: req.user.userId,
    items: body.items,
    userCouponId: body.userCouponId || null,
    building: body.building,
    room: body.room,
    phone: body.phone,
    deliveryMethod: body.deliveryMethod || 'door',
    deliveryTime: body.deliveryTime || '',
    remark: body.remark || ''
  })
  const order = await Order.findById(orderId)
  return success(res, order)
}

async function listByUser(req, res) {
  const userId = Number(req.params.userId)
  if (userId !== Number(req.user.userId)) {
    throw new AppError('forbidden', 403, 403)
  }
  const orders = await Order.findByUserId(userId)
  return success(res, orders)
}

async function detail(req, res) {
  const order = await Order.findById(req.params.id)
  if (!order) {
    throw new AppError('order not found', 404, 404)
  }
  if (Number(order.userId) !== Number(req.user.userId)) {
    throw new AppError('forbidden', 403, 403)
  }
  return success(res, order)
}

async function cancel(req, res) {
  await Order.cancel(req.params.id, req.user.userId)
  const order = await Order.findById(req.params.id)
  return success(res, order)
}

module.exports = {
  create,
  listByUser,
  detail,
  cancel
}
