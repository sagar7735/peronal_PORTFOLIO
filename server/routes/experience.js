const express = require('express')
const router = express.Router()
const { protect, adminOnly } = require('../middleware/auth')
const { companyLogoUpload, handleMulterError } = require('../middleware/upload')
const c = require('../controllers/experienceController')

const logoMiddleware = (req, res, next) =>
  companyLogoUpload.single('companyLogo')(req, res, (err) => {
    if (err) return handleMulterError(err, req, res, next)
    next()
  })

router.get('/experience', c.getExperience)
router.post('/admin/experience', protect, adminOnly, logoMiddleware, c.createExperience)
router.patch('/admin/experience/reorder', protect, adminOnly, c.reorderExperience)
router.put('/admin/experience/:id', protect, adminOnly, logoMiddleware, c.updateExperience)
router.delete('/admin/experience/:id', protect, adminOnly, c.deleteExperience)

module.exports = router
