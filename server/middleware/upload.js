const multer = require('multer')
const path = require('path')
const { v4: uuidv4 } = require('uuid')
const ApiError = require('../utils/ApiError')

const MAX_SIZE_MB = parseInt(process.env.MAX_FILE_SIZE_MB || '5', 10)
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024

// ─── Allowed types ────────────────────────────────────────────────────────────
const IMAGE_MIMETYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif']
const PDF_MIMETYPES = ['application/pdf']
const PDF_EXTENSIONS = ['.pdf']
const ATTACHMENT_MIMETYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/jpg',
  'image/png',
]
const ATTACHMENT_EXTENSIONS = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png']

// ─── Storage factory ──────────────────────────────────────────────────────────
function makeStorage(uploadDir) {
  return multer.diskStorage({
    destination: (req, file, cb) => cb(null, path.join(__dirname, '..', uploadDir)),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase()
      cb(null, `${uuidv4()}-${Date.now()}${ext}`)
    },
  })
}

// ─── File filter factory ──────────────────────────────────────────────────────
function makeFilter(allowedMimes, allowedExts) {
  return (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    if (allowedMimes.includes(file.mimetype) && allowedExts.includes(ext)) {
      cb(null, true)
    } else {
      cb(
        new ApiError(
          400,
          `Invalid file type. Allowed: ${allowedExts.join(', ')}`
        ),
        false
      )
    }
  }
}

// ─── Multer error handler ─────────────────────────────────────────────────────
function handleMulterError(err, req, res, next) {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: `File too large. Maximum size is ${MAX_SIZE_MB}MB.`,
      })
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files uploaded.',
      })
    }
    return res.status(400).json({ success: false, message: err.message })
  }
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({ success: false, message: err.message })
  }
  next(err)
}

// ─── Upload configs ───────────────────────────────────────────────────────────

// Avatar: single image
const avatarUpload = multer({
  storage: makeStorage('uploads/avatars'),
  limits: { fileSize: MAX_SIZE_BYTES, files: 1 },
  fileFilter: makeFilter(IMAGE_MIMETYPES, IMAGE_EXTENSIONS),
})

// Project thumbnail: single image
const projectThumbnailUpload = multer({
  storage: makeStorage('uploads/projects'),
  limits: { fileSize: MAX_SIZE_BYTES, files: 1 },
  fileFilter: makeFilter(IMAGE_MIMETYPES, IMAGE_EXTENSIONS),
})

// Project images: up to 8 images
const projectImagesUpload = multer({
  storage: makeStorage('uploads/projects'),
  limits: { fileSize: MAX_SIZE_BYTES, files: 8 },
  fileFilter: makeFilter(IMAGE_MIMETYPES, IMAGE_EXTENSIONS),
})

// Resume: PDF only
const resumeUpload = multer({
  storage: makeStorage('uploads/resume'),
  limits: { fileSize: MAX_SIZE_BYTES, files: 1 },
  fileFilter: makeFilter(PDF_MIMETYPES, PDF_EXTENSIONS),
})

// Testimonial avatar: single image
const testimonialAvatarUpload = multer({
  storage: makeStorage('uploads/testimonials'),
  limits: { fileSize: MAX_SIZE_BYTES, files: 1 },
  fileFilter: makeFilter(IMAGE_MIMETYPES, IMAGE_EXTENSIONS),
})

// Company logo: single image
const companyLogoUpload = multer({
  storage: makeStorage('uploads/logos'),
  limits: { fileSize: MAX_SIZE_BYTES, files: 1 },
  fileFilter: makeFilter(IMAGE_MIMETYPES, IMAGE_EXTENSIONS),
})

// Freelance attachment: pdf, doc, docx, png, jpg, jpeg (PRIVATE)
const freelanceAttachmentUpload = multer({
  storage: makeStorage('private-uploads/freelance-attachments'),
  limits: { fileSize: MAX_SIZE_BYTES, files: 1 },
  fileFilter: makeFilter(ATTACHMENT_MIMETYPES, ATTACHMENT_EXTENSIONS),
})

module.exports = {
  avatarUpload,
  projectThumbnailUpload,
  projectImagesUpload,
  resumeUpload,
  testimonialAvatarUpload,
  companyLogoUpload,
  freelanceAttachmentUpload,
  handleMulterError,
}
