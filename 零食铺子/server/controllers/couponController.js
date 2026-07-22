const Coupon = require('../models/couponModel')
const AppError = require('../utils/errors')
const { success } = require('../utils/response')

const couponTypes = ['new', 'full', 'delivery']

async function list(req, res) {
  const coupons = await Coupon.findAll()
  return success(res, coupons)
}

async function create(req, res) {
  const data = req.body
  if (!data.name || !data.type || data.amount === undefined) {
    throw new AppError('name, type and amount are required', 400, 400)
  }
  if (!couponTypes.includes(data.type)) {
    throw new AppError('coupon type is invalid', 400, 400)
  }
  const coupon = await Coupon.create(data)
  return success(res, coupon)
}

async function update(req, res) {
  const existing = await Coupon.findById(req.params.id)
  if (!existing) {
    throw new AppError('coupon not found', 404, 404)
  }
  if (req.body.type && !couponTypes.includes(req.body.type)) {
    throw new AppError('coupon type is invalid', 400, 400)
  }
  const coupon = await Coupon.update(req.params.id, req.body)
  return success(res, coupon)
}

async function remove(req, res) {
  const removed = await Coupon.remove(req.params.id)
  if (!removed) {
    throw new AppError('coupon not found', 404, 404)
  }
  return success(res, { id: Number(req.params.id) })
}

module.exports = {
  list,
  create,
  update,
  remove
}
