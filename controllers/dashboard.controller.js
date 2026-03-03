const Order = require('../models/Order');
const Product = require('../models/Product');
const Customer = require('../models/Customer');
const User = require('../models/User');

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private
exports.getStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Today's sales
    const todayOrders = await Order.find({
      createdAt: { $gte: today, $lt: tomorrow },
      paymentStatus: 'completed'
    });

    const todaySales = todayOrders.reduce((acc, order) => acc + order.total, 0);
    const todayOrdersCount = todayOrders.length;

    // This month's sales
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const monthOrders = await Order.find({
      createdAt: { $gte: startOfMonth, $lte: endOfMonth },
      paymentStatus: 'completed'
    });

    const monthSales = monthOrders.reduce((acc, order) => acc + order.total, 0);

    // Total counts
    const totalProducts = await Product.countDocuments();
    const totalCustomers = await Customer.countDocuments();
    const totalUsers = await User.countDocuments();

    // Low stock products
    const lowStockProducts = await Product.find({
      $expr: { $lte: ['$quantity', '$minStock'] }
    }).countDocuments();

    // Recent orders
    const recentOrders = await Order.find()
      .populate('customer', 'name')
      .populate('cashier', 'name')
      .sort('-createdAt')
      .limit(5);

    // Top selling products (this month)
    const topProducts = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfMonth, $lte: endOfMonth },
          paymentStatus: 'completed'
        }
      },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          name: { $first: '$items.name' },
          totalSold: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.subtotal' }
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 }
    ]);

    res.json({
      todaySales,
      todayOrdersCount,
      monthSales,
      totalProducts,
      totalCustomers,
      totalUsers,
      lowStockProducts,
      recentOrders,
      topProducts
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get sales report
// @route   GET /api/dashboard/sales-report
// @access  Private
exports.getSalesReport = async (req, res) => {
  try {
    const { startDate, endDate, groupBy = 'day' } = req.query;

    let start = startDate ? new Date(startDate) : new Date();
    let end = endDate ? new Date(endDate) : new Date();

    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    let dateFormat;
    switch (groupBy) {
      case 'month':
        dateFormat = { $dateToString: { format: '%Y-%m', date: '$createdAt' } };
        break;
      case 'week':
        dateFormat = { $dateToString: { format: '%Y-W%V', date: '$createdAt' } };
        break;
      default:
        dateFormat = { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } };
    }

    const salesData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end },
          paymentStatus: 'completed'
        }
      },
      {
        $group: {
          _id: dateFormat,
          totalSales: { $sum: '$total' },
          orderCount: { $sum: 1 },
          avgOrderValue: { $avg: '$total' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json(salesData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get payment methods summary
// @route   GET /api/dashboard/payment-summary
// @access  Private
exports.getPaymentSummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let matchQuery = { paymentStatus: 'completed' };

    if (startDate && endDate) {
      matchQuery.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const paymentSummary = await Order.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$paymentMethod',
          total: { $sum: '$total' },
          count: { $sum: 1 }
        }
      }
    ]);

    res.json(paymentSummary);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
