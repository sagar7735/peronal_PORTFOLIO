const sharp = require('sharp')
const path = require('path')
const fs = require('fs')

/**
 * Process a general image:
 * - Resize to max width 1600px (preserving aspect ratio)
 * - Convert to WebP at quality 80
 * - Delete the original file
 * - Returns the new relative path (e.g. "/uploads/projects/abc.webp")
 *
 * @param {string} filePath  Absolute path to the uploaded file
 * @param {string} relativeDir  Relative dir from server root, e.g. "uploads/projects"
 * @returns {Promise<string>} New relative URL path
 */
async function processImage(filePath, relativeDir) {
  const ext = path.extname(filePath)
  const webpPath = filePath.replace(ext, '.webp')

  await sharp(filePath)
    .resize({ width: 1600, withoutEnlargement: true })
    .webp({ quality: 80 })
    .toFile(webpPath)

  // Delete original only if the output is a different file
  if (filePath !== webpPath) {
    fs.unlink(filePath, (err) => {
      if (err) console.warn('⚠️  Could not delete original file:', filePath, err.message)
    })
  }

  // Return relative path with forward slashes
  const filename = path.basename(webpPath)
  return `/${relativeDir.replace(/\\/g, '/')}/${filename}`
}

/**
 * Process an avatar or logo:
 * - Resize to exactly 400×400 (cover/crop)
 * - Convert to WebP at quality 80
 * - Delete the original
 * - Returns the new relative path
 */
async function processAvatar(filePath, relativeDir) {
  const ext = path.extname(filePath)
  const webpPath = filePath.replace(ext, '.webp')

  await sharp(filePath)
    .resize(400, 400, { fit: 'cover', position: 'centre' })
    .webp({ quality: 80 })
    .toFile(webpPath)

  if (filePath !== webpPath) {
    fs.unlink(filePath, (err) => {
      if (err) console.warn('⚠️  Could not delete original file:', filePath, err.message)
    })
  }

  const filename = path.basename(webpPath)
  return `/${relativeDir.replace(/\\/g, '/')}/${filename}`
}

module.exports = { processImage, processAvatar }
