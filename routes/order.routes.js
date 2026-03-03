const express = require('express');
const router = express.Router();
const { getOrders, getOrder, createOrder, refundOrder, getTodayOrders } = require('../controllers/order.controller');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getOrders)
  .post(createOrder);

router.get('/today', getTodayOrders);

router.route('/:id')
  .get(getOrder);

router.put('/:id/refund', authorize('admin', 'manager'), refundOrder);

module.exports = router;
