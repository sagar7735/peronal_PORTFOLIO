const express = require('express')
const router = express.Router()
const rateLimit = require('express-rate-limit')
const { login, logout, getMe, changePassword } = require('../controllers/authController')
const { protect, adminOnly } = require('../middleware/auth')

// Login rate limit: 5 attempts per 15 minutes per IP
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many login attempts. Please try again after 15 minutes.',
  },
})

router.post('/login', loginLimiter, login)
router.post('/logout', logout)
router.get('/me', protect, adminOnly, getMe)
router.put('/change-password', protect, adminOnly, changePassword)

module.exports = router
