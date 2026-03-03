const Expense = require('../models/Expense');

// @desc    Get all expenses
// @route   GET /api/expenses
// @access  Private
exports.getExpenses = async (req, res) => {
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

    const expenses = await Expense.find(query)
      .populate('createdBy', 'name')
      .sort('-date');
    
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single expense
// @route   GET /api/expenses/:id
// @access  Private
exports.getExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id)
      .populate('createdBy', 'name');
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    res.json(expense);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create expense
// @route   POST /api/expenses
// @access  Private
exports.createExpense = async (req, res) => {
  try {
    const { title, category, amount, paymentMethod, date, description, isRecurring } = req.body;

    const expense = await Expense.create({
      title,
      category,
      amount,
      paymentMethod,
      date: date || Date.now(),
      description,
      isRecurring,
      receipt: req.file ? req.file.filename : null,
      createdBy: req.user._id
    });

    const populatedExpense = await Expense.findById(expense._id)
      .populate('createdBy', 'name');
    
    res.status(201).json(populatedExpense);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update expense
// @route   PUT /api/expenses/:id
// @access  Private
exports.updateExpense = async (req, res) => {
  try {
    const { title, category, amount, paymentMethod, date, description, isRecurring } = req.body;

    const expense = await Expense.findById(req.params.id);
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    expense.title = title || expense.title;
    expense.category = category || expense.category;
    expense.amount = amount !== undefined ? amount : expense.amount;
    expense.paymentMethod = paymentMethod || expense.paymentMethod;
    expense.date = date || expense.date;
    expense.description = description || expense.description;
    expense.isRecurring = isRecurring !== undefined ? isRecurring : expense.isRecurring;
    if (req.file) expense.receipt = req.file.filename;

    await expense.save();
    
    const populatedExpense = await Expense.findById(expense._id)
      .populate('createdBy', 'name');
    
    res.json(populatedExpense);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete expense
// @route   DELETE /api/expenses/:id
// @access  Private/Admin
exports.deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    await expense.deleteOne();
    res.json({ message: 'Expense removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get expense summary
// @route   GET /api/expenses/summary
// @access  Private
exports.getExpenseSummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let matchQuery = {};
    if (startDate && endDate) {
      matchQuery.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const summary = await Expense.aggregate([
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

    const totalExpenses = summary.reduce((acc, item) => acc + item.total, 0);

    res.json({
      byCategory: summary,
      totalExpenses
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
