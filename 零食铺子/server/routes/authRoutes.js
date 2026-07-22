const express = require('express')
const controller = require('../controllers/authController')
const asyncHandler = require('../utils/asyncHandler')

const router = express.Router()

router.post('/login', asyncHandler(controller.login))

module.exports = router
