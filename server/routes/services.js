const express = require('express')
const router = express.Router()
const { protect, adminOnly } = require('../middleware/auth')
const c = require('../controllers/serviceController')

router.get('/', c.getServices)
router.get('/admin', protect, adminOnly, c.getAdminServices)
router.post('/admin', protect, adminOnly, c.createService)
router.patch('/admin/reorder', protect, adminOnly, c.reorderServices)
router.put('/admin/:id', protect, adminOnly, c.updateService)
router.delete('/admin/:id', protect, adminOnly, c.deleteService)

module.exports = router
