// ── routes/adminRoutes.js ──
const router = require('express').Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { getAllUsers, setUserRole } = require('../controllers/userController');
const Habit = require('../models/Habit');

// Admin: get all users
router.get('/users', protect, adminOnly, getAllUsers);

// Admin: set role
router.put('/users/:id/role', protect, adminOnly, setUserRole);

// Admin: delete any habit
router.delete('/habits/:id', protect, adminOnly, async (req, res, next) => {
  try {
    const habit = await Habit.findByIdAndDelete(req.params.id);
    if (!habit) return res.status(404).json({ message: 'Habit not found' });
    res.json({ message: 'Habit permanently deleted by admin' });
  } catch (err) { next(err); }
});

// Admin: get all habits (all users)
router.get('/habits', protect, adminOnly, async (req, res, next) => {
  try {
    const habits = await Habit.find()
      .populate('user', 'username email')
      .sort({ createdAt: -1 })
      .limit(200);
    res.json({ habits, total: habits.length });
  } catch (err) { next(err); }
});

// Admin: site stats
router.get('/stats', protect, adminOnly, async (req, res, next) => {
  try {
    const User  = require('../models/User');
    const Log   = require('../models/index').Log;
    const [userCount, habitCount, logCount] = await Promise.all([
      User.countDocuments(),
      Habit.countDocuments(),
      Log.countDocuments(),
    ]);
    res.json({ users: userCount, habits: habitCount, logs: logCount });
  } catch (err) { next(err); }
});

module.exports = router;
