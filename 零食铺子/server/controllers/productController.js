const Product = require('../models/productModel')
const AppError = require('../utils/errors')
const { success } = require('../utils/response')

async function list(req, res) {
  const result = await Product.findAll(req.query)
  return success(res, result)
}

async function detail(req, res) {
  const product = await Product.findById(req.params.id)
  if (!product) {
    throw new AppError('product not found', 404, 404)
  }
  return success(res, product)
}

async function create(req, res) {
  const data = req.body
  if (!(data.categoryId || data.category_id) || !data.name || data.price === undefined) {
    throw new AppError('categoryId/category_id, name and price are required', 400, 400)
  }
  const product = await Product.create(data)
  return success(res, product)
}

async function update(req, res) {
  const existing = await Product.findById(req.params.id)
  if (!existing) {
    throw new AppError('product not found', 404, 404)
  }
  const product = await Product.update(req.params.id, req.body)
  return success(res, product)
}

async function remove(req, res) {
  const removed = await Product.remove(req.params.id)
  if (!removed) {
    throw new AppError('product not found', 404, 404)
  }
  return success(res, { id: Number(req.params.id) })
}

module.exports = {
  list,
  detail,
  create,
  update,
  remove
}
