const Income = require('../models/Income');
const Order = require('../models/Order');

// @desc    Get all incomes
// @route   GET /api/incomes
// @access  Private
exports.getIncomes = async (req, res) => {
  try {
    const { startDate, endDate, category } = req.query;
    let query = {};

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    if (category) {
      query.category = category;
    }

    const incomes = await Income.find(query)
      .populate('createdBy', 'name')
      .populate('order', 'orderNumber')
      .sort('-date');
    
    res.json(incomes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single income
// @route   GET /api/incomes/:id
// @access  Private
exports.getIncome = async (req, res) => {
  try {
    const income = await Income.findById(req.params.id)
      .populate('createdBy', 'name')
      .populate('order', 'orderNumber');
    if (!income) {
      return res.status(404).json({ message: 'Income not found' });
    }
    res.json(income);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create income
// @route   POST /api/incomes
// @access  Private
exports.createIncome = async (req, res) => {
  try {
    const { title, category, amount, paymentMethod, date, description, order } = req.body;

    const income = await Income.create({
      title,
      category,
      amount,
      paymentMethod,
      date: date || Date.now(),
      description,
      order,
      createdBy: req.user._id
    });

    const populatedIncome = await Income.findById(income._id)
      .populate('createdBy', 'name')
      .populate('order', 'orderNumber');
    
    res.status(201).json(populatedIncome);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update income
// @route   PUT /api/incomes/:id
// @access  Private
exports.updateIncome = async (req, res) => {
  try {
    const { title, category, amount, paymentMethod, date, description } = req.body;

    const income = await Income.findById(req.params.id);
    if (!income) {
      return res.status(404).json({ message: 'Income not found' });
    }

    income.title = title || income.title;
    income.category = category || income.category;
    income.amount = amount !== undefined ? amount : income.amount;
    income.paymentMethod = paymentMethod || income.paymentMethod;
    income.date = date || income.date;
    income.description = description || income.description;

    await income.save();
    
    const populatedIncome = await Income.findById(income._id)
      .populate('createdBy', 'name')
      .populate('order', 'orderNumber');
    
    res.json(populatedIncome);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete income
// @route   DELETE /api/incomes/:id
// @access  Private/Admin
exports.deleteIncome = async (req, res) => {
  try {
    const income = await Income.findById(req.params.id);
    if (!income) {
      return res.status(404).json({ message: 'Income not found' });
    }

    await income.deleteOne();
    res.json({ message: 'Income removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get income summary
// @route   GET /api/incomes/summary
// @access  Private
exports.getIncomeSummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let matchQuery = {};
    if (startDate && endDate) {
      matchQuery.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // Get manual income entries
    const incomeSummary = await Income.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { total: -1 } }
    ]);

    // Get sales income from orders
    let orderQuery = { paymentStatus: 'completed' };
    if (startDate && endDate) {
      orderQuery.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const salesIncome = await Order.aggregate([
      { $match: orderQuery },
      {
        $group: {
          _id: null,
          total: { $sum: '$total' },
          count: { $sum: 1 }
        }
      }
    ]);

    const totalManualIncome = incomeSummary.reduce((acc, item) => acc + item.total, 0);
    const totalSalesIncome = salesIncome[0]?.total || 0;

    res.json({
      byCategory: incomeSummary,
      salesIncome: {
        total: totalSalesIncome,
        count: salesIncome[0]?.count || 0
      },
      totalIncome: totalManualIncome + totalSalesIncome
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
