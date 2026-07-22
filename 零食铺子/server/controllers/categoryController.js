const Category = require('../models/categoryModel')
const { success } = require('../utils/response')

async function list(req, res) {
  const categories = await Category.findAll()
  return success(res, categories)
}

module.exports = {
  list
}
