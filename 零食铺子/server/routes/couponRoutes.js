const express = require('express')
const controller = require('../controllers/couponController')
const asyncHandler = require('../utils/asyncHandler')
const auth = require('../middleware/auth')

const router = express.Router()

router.get('/', asyncHandler(controller.list))
router.post('/', auth, asyncHandler(controller.create))
router.put('/:id', auth, asyncHandler(controller.update))
router.delete('/:id', auth, asyncHandler(controller.remove))

module.exports = router
