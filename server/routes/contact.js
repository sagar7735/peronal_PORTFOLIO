const express = require('express')
const router = express.Router()
const { protect, adminOnly } = require('../middleware/auth')
const { publicFormLimiter, honeypotCheck } = require('../middleware/spamProtection')
const c = require('../controllers/contactController')

router.post('/', publicFormLimiter, honeypotCheck('website'), c.sendMessage)
router.get('/admin', protect, adminOnly, c.getMessages)
router.get('/admin/:id', protect, adminOnly, c.getMessage)
router.patch('/admin/:id', protect, adminOnly, c.updateMessage)
router.delete('/admin/:id', protect, adminOnly, c.deleteMessage)

module.exports = router
