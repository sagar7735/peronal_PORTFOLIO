const express = require('express')
const router = express.Router()
const path = require('path')
const { avatarUpload, resumeUpload, handleMulterError } = require('../middleware/upload')
const { processAvatar } = require('../utils/imageProcessor')
const { getRelativePath } = require('../utils/getRelativePath')
const asyncHandler = require('../utils/asyncHandler')

// POST /api/test/avatar-upload — test image upload + Sharp processing
router.post(
  '/avatar-upload',
  (req, res, next) => avatarUpload.single('avatar')(req, res, (err) => {
    if (err) return handleMulterError(err, req, res, next)
    next()
  }),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' })
    }

    const webpRelPath = await processAvatar(
      req.file.path,
      'uploads/avatars'
    )

    res.json({
      success: true,
      message: 'Avatar uploaded and processed',
      data: { path: webpRelPath },
    })
  })
)

// POST /api/test/resume-upload — test PDF upload (no Sharp)
router.post(
  '/resume-upload',
  (req, res, next) => resumeUpload.single('resume')(req, res, (err) => {
    if (err) return handleMulterError(err, req, res, next)
    next()
  }),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' })
    }

    const relPath = getRelativePath(req.file, 'uploads/resume')
    res.json({
      success: true,
      message: 'Resume uploaded',
      data: { path: relPath },
    })
  })
)

module.exports = router
