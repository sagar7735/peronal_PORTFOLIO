const express = require('express')
const router = express.Router()
const { protect, adminOnly } = require('../middleware/auth')
const { testimonialAvatarUpload, handleMulterError } = require('../middleware/upload')
const { publicFormLimiter, honeypotCheck } = require('../middleware/spamProtection')
const c = require('../controllers/testimonialController')

const avatarMiddleware = (req, res, next) =>
  testimonialAvatarUpload.single('avatar')(req, res, (err) => {
    if (err) return handleMulterError(err, req, res, next)
    next()
  })

// Static admin routes first
router.get('/admin', protect, adminOnly, c.getAdminTestimonials)
router.patch('/admin/reorder', protect, adminOnly, c.reorderTestimonials)
router.put('/admin/:id', protect, adminOnly, avatarMiddleware, c.updateTestimonial)
router.delete('/admin/:id', protect, adminOnly, c.deleteTestimonial)

// Public
router.get('/', c.getTestimonials)
router.post('/', publicFormLimiter, honeypotCheck('website'), avatarMiddleware, c.submitTestimonial)

module.exports = router
