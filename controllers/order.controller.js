const Order = require('../models/Order');
const Product = require('../models/Product');
const Customer = require('../models/Customer');

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private
exports.getOrders = async (req, res) => {
  try {
    const { startDate, endDate, status, cashier } = req.query;
    let query = {};

    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    if (status) {
      query.paymentStatus = status;
    }

    if (cashier) {
      query.cashier = cashier;
    }

    const orders = await Order.find(query)
      .populate('customer', 'name phone')
      .populate('cashier', 'name')
      .sort('-createdAt');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer', 'name phone email')
      .populate('cashier', 'name')
      .populate('items.product', 'name sku');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create order
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res) => {
  try {
    const { items, subtotal, tax, discount, total, paymentMethod, amountReceived, change, customer, notes } = req.body;

    // Validate and update stock for each item
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ message: `Product ${item.product} not found` });
      }
      if (product.quantity < item.quantity) {
        return res.status(400).json({ 
          message: `Insufficient stock for ${product.name}. Available: ${product.quantity}` 
        });
      }
      // Update stock
      product.quantity -= item.quantity;
      await product.save();
    }

    // Create order
    const order = await Order.create({
      items,
      subtotal,
      tax,
      discount,
      total,
      paymentMethod,
      amountReceived,
      change,
      customer,
      cashier: req.user._id,
      notes
    });

    // Update customer total purchases and loyalty points
    if (customer) {
      const customerDoc = await Customer.findById(customer);
      if (customerDoc) {
        customerDoc.totalPurchases += total;
        customerDoc.loyaltyPoints += Math.floor(total / 10); // 1 point per $10 spent
        await customerDoc.save();
      }
    }

    const populatedOrder = await Order.findById(order._id)
      .populate('customer', 'name phone')
      .populate('cashier', 'name');

    res.status(201).json(populatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Refund order
// @route   PUT /api/orders/:id/refund
// @access  Private/Admin
exports.refundOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.paymentStatus === 'refunded') {
      return res.status(400).json({ message: 'Order already refunded' });
    }

    // Restore stock
    for (const item of order.items) {
      const product = await Product.findById(item.product);
      if (product) {
        product.quantity += item.quantity;
        await product.save();
      }
    }

    // Update customer loyalty points
    if (order.customer) {
      const customer = await Customer.findById(order.customer);
      if (customer) {
        customer.totalPurchases -= order.total;
        customer.loyaltyPoints -= Math.floor(order.total / 10);
        if (customer.loyaltyPoints < 0) customer.loyaltyPoints = 0;
        await customer.save();
      }
    }

    order.paymentStatus = 'refunded';
    await order.save();

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get today's orders
// @route   GET /api/orders/today
// @access  Private
exports.getTodayOrders = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const orders = await Order.find({
      createdAt: { $gte: today, $lt: tomorrow }
    })
      .populate('customer', 'name phone')
      .populate('cashier', 'name')
      .sort('-createdAt');

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
