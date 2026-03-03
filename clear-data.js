const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const Product = require('./models/Product');
const Category = require('./models/Category');
const Customer = require('./models/Customer');
const Order = require('./models/Order');
const Income = require('./models/Income');
const Expense = require('./models/Expense');

const clearData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear all data except users
    await Product.deleteMany({});
    console.log('Products cleared');

    await Category.deleteMany({});
    console.log('Categories cleared');

    await Customer.deleteMany({});
    console.log('Customers cleared');

    await Order.deleteMany({});
    console.log('Orders cleared');

    await Income.deleteMany({});
    console.log('Income cleared');

    await Expense.deleteMany({});
    console.log('Expenses cleared');

    console.log('\n✅ All data cleared! Users are kept.');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

clearData();
