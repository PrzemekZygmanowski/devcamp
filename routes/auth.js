const express = require('express');
const {
  register,
  login,
  getMe,
  forgotPassword,
} = require('../controllers/auth');

const router = express.Router();

// // import protect middleware
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.post('/forgotpassword', forgotPassword);

module.exports = router;
