const express = require('express');
const router = express.Router();
const { 
  getIncomes, 
  getIncome, 
  createIncome, 
  updateIncome, 
  deleteIncome,
  getIncomeSummary 
} = require('../controllers/income.controller');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/summary', getIncomeSummary);

router.route('/')
  .get(getIncomes)
  .post(authorize('admin', 'manager'), createIncome);

router.route('/:id')
  .get(getIncome)
  .put(authorize('admin', 'manager'), updateIncome)
  .delete(authorize('admin'), deleteIncome);

module.exports = router;
