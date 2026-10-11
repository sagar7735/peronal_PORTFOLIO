const rateLimit = require('express-rate-limit')
const ApiError = require('../utils/ApiError')

// Rate limit: 3 public form submissions per hour per IP
exports.publicFormLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  keyGenerator: (req) => req.ip,
  message: { success: false, message: 'Too many submissions. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
})

// Honeypot check — reject if hidden field is filled
exports.honeypotCheck = (honeypotField = 'website') => (req, res, next) => {
  if (req.body[honeypotField] && req.body[honeypotField].trim() !== '') {
    // Silently succeed (don't let bots know they were caught)
    return res.status(200).json({ success: true, message: 'Submitted successfully.' })
  }
  next()
}
