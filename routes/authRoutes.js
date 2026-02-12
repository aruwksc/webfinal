// ── routes/authRoutes.js ──
const router = require('express').Router();
const { register, login } = require('../controllers/authController');
const { validate } = require('../middleware/validateMiddleware');

router.post('/register', validate('register'), register);
router.post('/login',    validate('login'),    login);

module.exports = router;
