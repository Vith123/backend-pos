const StockMovement = require('../models/StockMovement');
const Product = require('../models/Product');

// @desc    Get all stock movements
// @route   GET /api/stock
// @access  Private
exports.getStockMovements = async (req, res) => {
  try {
    const { product, type, startDate, endDate, page = 1, limit = 50 } = req.query;
    
    let query = {};
    
    if (product) {
      query.product = product;
    }
    
    if (type) {
      query.type = type;
    }
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;
    
    const [movements, total] = await Promise.all([
      StockMovement.find(query)
        .populate('product', 'name sku')
        .populate('createdBy', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      StockMovement.countDocuments(query)
    ]);

    res.json({
      movements,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create stock movement (stock in/out)
// @route   POST /api/stock
// @access  Private (admin, manager)
exports.createStockMovement = async (req, res) => {
  try {
    const { productId, type, quantity, reason, note } = req.body;

    // Find product
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const previousQuantity = product.quantity;
    let newQuantity;

    if (type === 'in') {
      newQuantity = previousQuantity + quantity;
    } else if (type === 'out') {
      if (quantity > previousQuantity) {
        return res.status(400).json({ 
          message: `Insufficient stock. Available: ${previousQuantity}` 
        });
      }
      newQuantity = previousQuantity - quantity;
    }

    // Update product quantity
    product.quantity = newQuantity;
    await product.save();

    // Create stock movement record
    const stockMovement = await StockMovement.create({
      product: productId,
      type,
      quantity,
      reason,
      note,
      previousQuantity,
      newQuantity,
      createdBy: req.user._id
    });

    const populatedMovement = await StockMovement.findById(stockMovement._id)
      .populate('product', 'name sku')
      .populate('createdBy', 'name');

    res.status(201).json(populatedMovement);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get stock movement by ID
// @route   GET /api/stock/:id
// @access  Private
exports.getStockMovementById = async (req, res) => {
  try {
    const movement = await StockMovement.findById(req.params.id)
      .populate('product', 'name sku')
      .populate('createdBy', 'name');

    if (!movement) {
      return res.status(404).json({ message: 'Stock movement not found' });
    }

    res.json(movement);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get stock summary for a product
// @route   GET /api/stock/summary/:productId
// @access  Private
exports.getProductStockSummary = async (req, res) => {
  try {
    const { productId } = req.params;
    
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const [totalIn, totalOut, movements] = await Promise.all([
      StockMovement.aggregate([
        { $match: { product: product._id, type: 'in' } },
        { $group: { _id: null, total: { $sum: '$quantity' } } }
      ]),
      StockMovement.aggregate([
        { $match: { product: product._id, type: 'out' } },
        { $group: { _id: null, total: { $sum: '$quantity' } } }
      ]),
      StockMovement.find({ product: productId })
        .populate('createdBy', 'name')
        .sort({ createdAt: -1 })
        .limit(10)
    ]);

    res.json({
      product: {
        _id: product._id,
        name: product.name,
        currentStock: product.quantity,
        minStock: product.minStock
      },
      totalStockIn: totalIn[0]?.total || 0,
      totalStockOut: totalOut[0]?.total || 0,
      recentMovements: movements
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
