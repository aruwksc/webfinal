// ── routes/userRoutes.js ──
const router = require('express').Router();
const { getProfile, updateProfile, deleteProfile } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validateMiddleware');

router.get('/profile',    protect, getProfile);
router.put('/profile',    protect, validate('profile'), updateProfile);
router.delete('/profile', protect, deleteProfile);

module.exports = router;
