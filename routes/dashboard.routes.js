const express = require('express');
const router = express.Router();
const { getStats, getSalesReport, getPaymentSummary } = require('../controllers/dashboard.controller');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/stats', getStats);
router.get('/sales-report', getSalesReport);
router.get('/payment-summary', getPaymentSummary);

module.exports = router;
