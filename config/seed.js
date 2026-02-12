require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./db');
const User  = require('../models/User');
const Habit = require('../models/Habit');

const seedData = async () => {
  await connectDB();

  try {
    await User.deleteMany({ email: { $in: ['demo@habitflow.com', 'admin@habitflow.com'] } });

    const admin = await User.create({
      username: 'admin',
      email: 'admin@habitflow.com',
      password: 'admin123',
      role: 'admin',
    });

    const demo = await User.create({
      username: 'demouser',
      email: 'demo@habitflow.com',
      password: 'demo123',
      firstName: 'Demo',
      lastName: 'User',
    });

    const today = new Date();
    const getDates = (n) => Array.from({ length: n }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      return d.toISOString().split('T')[0];
    });

    await Habit.insertMany([
      {
        user: demo._id,
        name: 'Morning Run',
        description: '30 minutes outdoor running',
        category: 'health',
        frequency: 'daily',
        color: '#2EC4B6',
        streak: 7,
        completedDates: getDates(7),
      },
      {
        user: demo._id,
        name: 'Read 30 Pages',
        description: 'Build a reading habit',
        category: 'mind',
        frequency: 'daily',
        color: '#6C63FF',
        streak: 12,
        completedDates: getDates(12),
      },
      {
        user: demo._id,
        name: 'Meditate',
        description: '10 minutes mindfulness',
        category: 'mind',
        frequency: 'daily',
        color: '#FFB347',
        streak: 5,
        completedDates: getDates(5),
      },
      {
        user: demo._id,
        name: 'Study Spanish',
        description: 'Duolingo or textbook',
        category: 'work',
        frequency: 'weekdays',
        color: '#FF6B6B',
        streak: 3,
        completedDates: getDates(3),
      },
      {
        user: demo._id,
        name: 'Drink 2L Water',
        description: 'Stay hydrated throughout the day',
        category: 'health',
        frequency: 'daily',
        color: '#56CCF2',
        streak: 15,
        completedDates: getDates(15),
      },
    ]);

    console.log(' Seed complete!');
    console.log(' Demo user: demo@habitflow.com / demo123');
    console.log(' Admin user: admin@habitflow.com / admin123');
  } catch (err) {
    console.error('Seed error:', err);
  } finally {
    mongoose.connection.close();
  }
};

seedData();
