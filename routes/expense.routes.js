const express = require('express');
const router = express.Router();
const { 
  getExpenses, 
  getExpense, 
  createExpense, 
  updateExpense, 
  deleteExpense,
  getExpenseSummary 
} = require('../controllers/expense.controller');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(protect);

router.get('/summary', getExpenseSummary);

router.route('/')
  .get(getExpenses)
  .post(authorize('admin', 'manager'), upload.single('receipt'), createExpense);

router.route('/:id')
  .get(getExpense)
  .put(authorize('admin', 'manager'), upload.single('receipt'), updateExpense)
  .delete(authorize('admin'), deleteExpense);

module.exports = router;
