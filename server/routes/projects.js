const express = require('express')
const router = express.Router()
const { protect, adminOnly } = require('../middleware/auth')
const { handleMulterError } = require('../middleware/upload')
const multer = require('multer')
const path = require('path')
const { v4: uuidv4 } = require('uuid')
const ApiError = require('../utils/ApiError')
const c = require('../controllers/projectController')

const MAX_SIZE_BYTES = parseInt(process.env.MAX_FILE_SIZE_MB || '5', 10) * 1024 * 1024
const IMAGE_MIMETYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif']

const projectUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads/projects')),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase()
      cb(null, `${uuidv4()}-${Date.now()}${ext}`)
    },
  }),
  limits: { fileSize: MAX_SIZE_BYTES, files: 9 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    if (IMAGE_MIMETYPES.includes(file.mimetype) && IMAGE_EXTENSIONS.includes(ext)) return cb(null, true)
    cb(new ApiError(400, 'Invalid file type. Only images allowed.'), false)
  },
})

const projectFilesMiddleware = (req, res, next) =>
  projectUpload.fields([{ name: 'thumbnail', maxCount: 1 }, { name: 'images', maxCount: 8 }])(
    req, res, (err) => {
      if (err) return handleMulterError(err, req, res, next)
      next()
    }
  )

// Static routes first (before dynamic :slug / :id)
router.get('/admin', protect, adminOnly, c.getAdminProjects)
router.post('/', protect, adminOnly, projectFilesMiddleware, c.createProject)
router.patch('/reorder', protect, adminOnly, c.reorderProjects)

// Public
router.get('/', c.getProjects)
router.get('/:slug', c.getProjectBySlug)

// Admin with dynamic :id
router.put('/:id', protect, adminOnly, projectFilesMiddleware, c.updateProject)
router.delete('/:id/image', protect, adminOnly, c.removeProjectImage)
router.delete('/:id', protect, adminOnly, c.deleteProject)

module.exports = router
