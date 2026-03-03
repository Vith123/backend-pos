const express = require('express');
const router = express.Router();
const { 
  getProducts, 
  getProduct, 
  getProductByBarcode,
  createProduct, 
  updateProduct, 
  updateStock,
  deleteProduct 
} = require('../controllers/product.controller');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(protect);

router.route('/')
  .get(getProducts)
  .post(authorize('admin', 'manager'), upload.single('image'), createProduct);

router.get('/barcode/:barcode', getProductByBarcode);

router.route('/:id')
  .get(getProduct)
  .put(authorize('admin', 'manager'), upload.single('image'), updateProduct)
  .delete(authorize('admin'), deleteProduct);

router.patch('/:id/stock', authorize('admin', 'manager'), updateStock);

module.exports = router;
