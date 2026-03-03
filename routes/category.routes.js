const express = require('express');
const router = express.Router();
const { getCategories, getCategory, createCategory, updateCategory, deleteCategory } = require('../controllers/category.controller');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(protect);

router.route('/')
  .get(getCategories)
  .post(authorize('admin', 'manager'), upload.single('image'), createCategory);

router.route('/:id')
  .get(getCategory)
  .put(authorize('admin', 'manager'), upload.single('image'), updateCategory)
  .delete(authorize('admin'), deleteCategory);

module.exports = router;
