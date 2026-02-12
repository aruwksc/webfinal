const User = require('../models/User');

const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user });
  } catch (err) { next(err); }
};

const updateProfile = async (req, res, next) => {
  try {
    const { username, email, firstName, lastName, bio, currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select('+password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (email && email !== user.email) {
      const dup = await User.findOne({ email });
      if (dup) return res.status(400).json({ message: 'Email already in use' });
      user.email = email;
    }
    if (username && username !== user.username) {
      const dup = await User.findOne({ username });
      if (dup) return res.status(400).json({ message: 'Username already taken' });
      user.username = username;
    }

    if (firstName !== undefined) user.firstName = firstName;
    if (lastName  !== undefined) user.lastName  = lastName;
    if (bio       !== undefined) user.bio       = bio;

    if (newPassword) {
      if (!currentPassword) return res.status(400).json({ message: 'Current password required' });
      const ok = await user.comparePassword(currentPassword);
      if (!ok) return res.status(401).json({ message: 'Current password is incorrect' });
      user.password = newPassword;
    }

    await user.save();
    res.json({ user: user.toJSON(), message: 'Profile updated' });
  } catch (err) { next(err); }
};

const deleteProfile = async (req, res, next) => {
  try {
    await User.findByIdAndDelete(req.user._id);
    res.json({ message: 'Account deleted' });
  } catch (err) { next(err); }
};

const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ users, total: users.length });
  } catch (err) { next(err); }
};

const setUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) return res.status(400).json({ message: 'Invalid role' });
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user, message: `Role updated to ${role}` });
  } catch (err) { next(err); }
};

module.exports = { getProfile, updateProfile, deleteProfile, getAllUsers, setUserRole };
