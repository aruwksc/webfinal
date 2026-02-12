const jwt  = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET || 'habitflow_secret_key', { expiresIn: '30d' });

const register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    const exists = await User.findOne({ $or: [{ email }, { username }] });
    if (exists) {
      return res.status(400).json({ message: exists.email === email ? 'Email already in use' : 'Username already taken' });
    }

    const user  = await User.create({ username, email, password });
    const token = generateToken(user._id);

    res.status(201).json({ token, user });
  } catch (err) { next(err); }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(user._id);
    const userData = user.toJSON();
    res.json({ token, user: userData });
  } catch (err) { next(err); }
};

module.exports = { register, login };
