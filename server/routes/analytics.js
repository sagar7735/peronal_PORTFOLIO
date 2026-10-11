const express = require('express')
const router = express.Router()
const { protect, adminOnly } = require('../middleware/auth')
const { trackPageView, getDashboardStats } = require('../controllers/analyticsController')

router.post('/track', trackPageView)
router.get('/admin/dashboard-stats', protect, adminOnly, getDashboardStats)

module.exports = router
