const express = require('express')
const router = express.Router()
const { getProfile, updateProfile } = require('../controllers/profileController')
const { protect, adminOnly } = require('../middleware/auth')
const { handleMulterError } = require('../middleware/upload')
const multer = require('multer')
const path = require('path')
const { v4: uuidv4 } = require('uuid')
const ApiError = require('../utils/ApiError')

const MAX_SIZE_BYTES = parseInt(process.env.MAX_FILE_SIZE_MB || '5', 10) * 1024 * 1024

const profileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = file.fieldname === 'resume'
      ? path.join(__dirname, '../uploads/resume')
      : path.join(__dirname, '../uploads/avatars')
    cb(null, dir)
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    cb(null, `${uuidv4()}-${Date.now()}${ext}`)
  },
})

const profileFileFilter = (req, file, cb) => {
  if (file.fieldname === 'resume') {
    const ext = path.extname(file.originalname).toLowerCase()
    if (file.mimetype === 'application/pdf' && ext === '.pdf') return cb(null, true)
    return cb(new ApiError(400, 'Resume must be a PDF'), false)
  }
  // avatar
  const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
  const allowedExt = ['.jpg', '.jpeg', '.png', '.webp', '.gif']
  const ext = path.extname(file.originalname).toLowerCase()
  if (allowed.includes(file.mimetype) && allowedExt.includes(ext)) return cb(null, true)
  cb(new ApiError(400, 'Avatar must be an image'), false)
}

const profileUpload = multer({
  storage: profileStorage,
  limits: { fileSize: MAX_SIZE_BYTES },
  fileFilter: profileFileFilter,
})

// Public
router.get('/profile', getProfile)

// Admin — mixed upload: avatar (image) + resume (pdf)
router.put(
  '/admin/profile',
  protect,
  adminOnly,
  (req, res, next) =>
    profileUpload.fields([{ name: 'avatar', maxCount: 1 }, { name: 'resume', maxCount: 1 }])(
      req, res, (err) => {
        if (err) return handleMulterError(err, req, res, next)
        next()
      }
    ),
  updateProfile
)

module.exports = router
