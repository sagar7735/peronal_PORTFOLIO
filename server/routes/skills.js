const express = require('express')
const router = express.Router()
const { protect, adminOnly } = require('../middleware/auth')
const c = require('../controllers/skillController')

router.get('/skills', c.getSkills)
router.post('/admin/skills', protect, adminOnly, c.createSkill)
router.patch('/admin/skills/reorder', protect, adminOnly, c.reorderSkills)
router.put('/admin/skills/:id', protect, adminOnly, c.updateSkill)
router.delete('/admin/skills/:id', protect, adminOnly, c.deleteSkill)

module.exports = router
