const express = require('express')
const controller = require('../controllers/userCouponController')
const asyncHandler = require('../utils/asyncHandler')
const auth = require('../middleware/auth')

const router = express.Router()

router.post('/', auth, asyncHandler(controller.receive))
router.get('/:userId', auth, asyncHandler(controller.listByUser))

module.exports = router
