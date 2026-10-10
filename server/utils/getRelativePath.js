const path = require('path')

/**
 * Given an uploaded file object (req.file from multer) and the
 * subdirectory it was saved to (e.g. "uploads/avatars"),
 * return the relative path used for DB storage (e.g. "/uploads/avatars/abc.webp").
 *
 * After Sharp processing, the .webp version is what should be stored.
 * This helper is for PDFs and other non-image files that skip Sharp.
 *
 * @param {object} file  req.file from multer
 * @param {string} subDir  e.g. "uploads/resume" or "private-uploads/freelance-attachments"
 * @returns {string}
 */
function getRelativePath(file, subDir) {
  const filename = file.filename
  return `/${subDir.replace(/\\/g, '/')}/${filename}`
}

module.exports = { getRelativePath }
