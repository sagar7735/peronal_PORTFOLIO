const express = require('express')
const router = express.Router()
const { protect, adminOnly } = require('../middleware/auth')
const { freelanceAttachmentUpload, handleMulterError } = require('../middleware/upload')
const { publicFormLimiter, honeypotCheck } = require('../middleware/spamProtection')
const c = require('../controllers/freelanceController')

const attachMiddleware = (req, res, next) =>
  freelanceAttachmentUpload.single('attachment')(req, res, (err) => {
    if (err) return handleMulterError(err, req, res, next)
    next()
  })

// Public
router.post('/apply', publicFormLimiter, honeypotCheck('website'), attachMiddleware, c.submitApplication)

// Admin — static routes before dynamic :id
router.get('/admin', protect, adminOnly, c.getApplications)
router.get('/admin/export', protect, adminOnly, c.exportApplications)
router.get('/admin/:id/attachment', protect, adminOnly, c.downloadAttachment)
router.get('/admin/:id', protect, adminOnly, c.getApplication)
router.patch('/admin/:id', protect, adminOnly, c.updateApplication)
router.delete('/admin/:id', protect, adminOnly, c.deleteApplication)

module.exports = router
