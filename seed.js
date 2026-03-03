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

    // Create Categories with images
    const categories = await Category.create([
      { name: 'Beverages', description: 'Drinks and beverages', image: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=200&h=200&fit=crop' },
      { name: 'Food', description: 'Food items', image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=200&h=200&fit=crop' },
      { name: 'Snacks', description: 'Snacks and chips', image: 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=200&h=200&fit=crop' },
      { name: 'Electronics', description: 'Electronic items', image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=200&h=200&fit=crop' },
      { name: 'Groceries', description: 'Daily groceries', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&h=200&fit=crop' }
    ]);
    console.log('Categories created');

    // Create Products with images
    const products = await Product.create([
      { name: 'Coca Cola', category: categories[0]._id, price: 2.50, costPrice: 1.50, quantity: 100, minStock: 20, image: 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=200&h=200&fit=crop' },
      { name: 'Pepsi', category: categories[0]._id, price: 2.50, costPrice: 1.50, quantity: 80, minStock: 20, image: 'https://images.unsplash.com/photo-1553456558-aff63285bdd1?w=200&h=200&fit=crop' },
      { name: 'Orange Juice', category: categories[0]._id, price: 3.00, costPrice: 1.80, quantity: 50, minStock: 15, image: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=200&h=200&fit=crop' },
      { name: 'Water Bottle', category: categories[0]._id, price: 1.50, costPrice: 0.50, quantity: 200, minStock: 50, image: 'https://images.unsplash.com/photo-1560023907-5f339617ea30?w=200&h=200&fit=crop' },
      { name: 'Coffee', category: categories[0]._id, price: 4.00, costPrice: 2.00, quantity: 60, minStock: 15, image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=200&h=200&fit=crop' },
      { name: 'Burger', category: categories[1]._id, price: 8.50, costPrice: 4.50, quantity: 30, minStock: 10, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&h=200&fit=crop' },
      { name: 'Pizza Slice', category: categories[1]._id, price: 5.00, costPrice: 2.50, quantity: 40, minStock: 10, image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=200&h=200&fit=crop' },
      { name: 'Sandwich', category: categories[1]._id, price: 6.00, costPrice: 3.00, quantity: 35, minStock: 10, image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=200&h=200&fit=crop' },
      { name: 'Hot Dog', category: categories[1]._id, price: 4.50, costPrice: 2.00, quantity: 45, minStock: 10, image: 'https://images.unsplash.com/photo-1612392062631-94e3566f2c34?w=200&h=200&fit=crop' },
      { name: 'Salad', category: categories[1]._id, price: 7.00, costPrice: 3.50, quantity: 25, minStock: 8, image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=200&h=200&fit=crop' },
      { name: 'Chips', category: categories[2]._id, price: 2.00, costPrice: 1.00, quantity: 150, minStock: 30, image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=200&h=200&fit=crop' },
      { name: 'Cookies', category: categories[2]._id, price: 3.00, costPrice: 1.50, quantity: 100, minStock: 25, image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=200&h=200&fit=crop' },
      { name: 'Chocolate Bar', category: categories[2]._id, price: 2.50, costPrice: 1.20, quantity: 120, minStock: 30, image: 'https://images.unsplash.com/photo-1575377427642-087cf684f29d?w=200&h=200&fit=crop' },
      { name: 'Popcorn', category: categories[2]._id, price: 4.00, costPrice: 2.00, quantity: 60, minStock: 15, image: 'https://images.unsplash.com/photo-1585647347483-22b66260dfff?w=200&h=200&fit=crop' },
      { name: 'Earphones', category: categories[3]._id, price: 15.00, costPrice: 8.00, quantity: 25, minStock: 5, image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=200&h=200&fit=crop' },
      { name: 'Phone Charger', category: categories[3]._id, price: 12.00, costPrice: 6.00, quantity: 30, minStock: 8, image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=200&h=200&fit=crop' },
      { name: 'USB Cable', category: categories[3]._id, price: 8.00, costPrice: 4.00, quantity: 40, minStock: 10, image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=200&fit=crop' },
      { name: 'Rice (1kg)', category: categories[4]._id, price: 5.00, costPrice: 3.00, quantity: 80, minStock: 20, image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=200&h=200&fit=crop' },
      { name: 'Bread', category: categories[4]._id, price: 3.50, costPrice: 2.00, quantity: 50, minStock: 15, image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=200&h=200&fit=crop' },
      { name: 'Milk (1L)', category: categories[4]._id, price: 4.00, costPrice: 2.50, quantity: 60, minStock: 15, image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=200&h=200&fit=crop' }
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
