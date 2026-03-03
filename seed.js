const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

// Import Models
const User = require('./models/User');
const Category = require('./models/Category');
const Product = require('./models/Product');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});
    console.log('Cleared existing data');

    // Create Admin User
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@pos.com',
      password: 'admin123',
      role: 'admin'
    });
    console.log('Admin user created');

    // Create Cashier User
    await User.create({
      name: 'Cashier User',
      email: 'cashier@pos.com',
      password: 'cashier123',
      role: 'cashier'
    });
    console.log('Cashier user created');

    // Create Categories
    const categories = await Category.create([
      { name: 'Beverages', description: 'Drinks and beverages' },
      { name: 'Food', description: 'Food items' },
      { name: 'Snacks', description: 'Snacks and chips' },
      { name: 'Electronics', description: 'Electronic items' },
      { name: 'Groceries', description: 'Daily groceries' }
    ]);
    console.log('Categories created');

    // Create Products
    const products = await Product.create([
      { name: 'Coca Cola', category: categories[0]._id, price: 2.50, costPrice: 1.50, quantity: 100, minStock: 20 },
      { name: 'Pepsi', category: categories[0]._id, price: 2.50, costPrice: 1.50, quantity: 80, minStock: 20 },
      { name: 'Orange Juice', category: categories[0]._id, price: 3.00, costPrice: 1.80, quantity: 50, minStock: 15 },
      { name: 'Water Bottle', category: categories[0]._id, price: 1.50, costPrice: 0.50, quantity: 200, minStock: 50 },
      { name: 'Coffee', category: categories[0]._id, price: 4.00, costPrice: 2.00, quantity: 60, minStock: 15 },
      { name: 'Burger', category: categories[1]._id, price: 8.50, costPrice: 4.50, quantity: 30, minStock: 10 },
      { name: 'Pizza Slice', category: categories[1]._id, price: 5.00, costPrice: 2.50, quantity: 40, minStock: 10 },
      { name: 'Sandwich', category: categories[1]._id, price: 6.00, costPrice: 3.00, quantity: 35, minStock: 10 },
      { name: 'Hot Dog', category: categories[1]._id, price: 4.50, costPrice: 2.00, quantity: 45, minStock: 10 },
      { name: 'Salad', category: categories[1]._id, price: 7.00, costPrice: 3.50, quantity: 25, minStock: 8 },
      { name: 'Chips', category: categories[2]._id, price: 2.00, costPrice: 1.00, quantity: 150, minStock: 30 },
      { name: 'Cookies', category: categories[2]._id, price: 3.00, costPrice: 1.50, quantity: 100, minStock: 25 },
      { name: 'Chocolate Bar', category: categories[2]._id, price: 2.50, costPrice: 1.20, quantity: 120, minStock: 30 },
      { name: 'Popcorn', category: categories[2]._id, price: 4.00, costPrice: 2.00, quantity: 60, minStock: 15 },
      { name: 'Earphones', category: categories[3]._id, price: 15.00, costPrice: 8.00, quantity: 25, minStock: 5 },
      { name: 'Phone Charger', category: categories[3]._id, price: 12.00, costPrice: 6.00, quantity: 30, minStock: 8 },
      { name: 'USB Cable', category: categories[3]._id, price: 8.00, costPrice: 4.00, quantity: 40, minStock: 10 },
      { name: 'Rice (1kg)', category: categories[4]._id, price: 5.00, costPrice: 3.00, quantity: 80, minStock: 20 },
      { name: 'Bread', category: categories[4]._id, price: 3.50, costPrice: 2.00, quantity: 50, minStock: 15 },
      { name: 'Milk (1L)', category: categories[4]._id, price: 4.00, costPrice: 2.50, quantity: 60, minStock: 15 }
    ]);
    console.log('Products created');

    console.log('\n=== Seed Data Complete ===');
    console.log('\nDefault Login Credentials:');
    console.log('Admin: admin@pos.com / admin123');
    console.log('Cashier: cashier@pos.com / cashier123');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
