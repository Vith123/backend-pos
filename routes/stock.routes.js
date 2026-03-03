const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const {
  getStockMovements,
  createStockMovement,
  getStockMovementById,
  getProductStockSummary
} = require('../controllers/stock.controller');

router.use(authenticate);

router.get('/', getStockMovements);
router.post('/', authorize('admin', 'manager'), createStockMovement);
router.get('/summary/:productId', getProductStockSummary);
router.get('/:id', getStockMovementById);

module.exports = router;
