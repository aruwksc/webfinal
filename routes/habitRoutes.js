// ── routes/habitRoutes.js ──
const router = require('express').Router();
const {
  createHabit, getHabits, getHabit, updateHabit, deleteHabit, checkinHabit
} = require('../controllers/habitController');
const { protect } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validateMiddleware');

router.post('/',           protect, validate('habit'), createHabit);
router.get('/',            protect, getHabits);
router.get('/:id',         protect, getHabit);
router.put('/:id',         protect, updateHabit);
router.delete('/:id',      protect, deleteHabit);
router.post('/:id/checkin',protect, checkinHabit);

module.exports = router;
