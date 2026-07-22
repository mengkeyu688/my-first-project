const UserCoupon = require('../models/userCouponModel')
const AppError = require('../utils/errors')
const { success } = require('../utils/response')

async function receive(req, res) {
  const userId = req.user.userId
  const couponId = req.body.couponId
  if (!couponId) {
    throw new AppError('couponId is required', 400, 400)
  }
  const id = await UserCoupon.receive(userId, couponId)
  const coupons = await UserCoupon.findByUserId(userId)
  const userCoupon = coupons.find(item => item.id === id)
  return success(res, userCoupon)
}

async function listByUser(req, res) {
  const userId = Number(req.params.userId)
  if (userId !== Number(req.user.userId)) {
    throw new AppError('forbidden', 403, 403)
  }
  const coupons = await UserCoupon.findByUserId(userId)
  return success(res, coupons)
}

module.exports = {
  receive,
  listByUser
}
