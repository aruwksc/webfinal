// ── routes/logRoutes.js ──
const router = require('express').Router();
const { protect } = require('../middleware/authMiddleware');

// Get logs for user (with optional date range)
router.get('/', protect, async (req, res, next) => {
  try {
    const Log = require('../models/index').Log;
    const { from, to, habitId } = req.query;
    const filter = { user: req.user._id };
    if (habitId) filter.habit = habitId;
    if (from || to) {
      filter.date = {};
      if (from) filter.date.$gte = from;
      if (to)   filter.date.$lte = to;
    }
    const logs = await Log.find(filter)
      .populate('habit', 'name color category')
      .sort({ date: -1 })
      .limit(100);
    res.json({ logs, total: logs.length });
  } catch (err) { next(err); }
});

// Get log by ID
router.get('/:id', protect, async (req, res, next) => {
  try {
    const Log = require('../models/index').Log;
    const log = await Log.findOne({ _id: req.params.id, user: req.user._id })
      .populate('habit', 'name color category');
    if (!log) return res.status(404).json({ message: 'Log not found' });
    res.json({ log });
  } catch (err) { next(err); }
});

module.exports = router;


// ── routes/adminRoutes.js ── (separate file below)
