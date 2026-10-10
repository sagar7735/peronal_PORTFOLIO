const fs = require('fs')
const path = require('path')

/**
 * Safely delete a file given its relative path (e.g. "/uploads/projects/abc.webp")
 * or an absolute path.
 * Silently ignores missing files.
 *
 * @param {string} filePath  Relative path (starting with /) or absolute path
 */
function deleteFile(filePath) {
  if (!filePath) return

  let absPath
  if (path.isAbsolute(filePath)) {
    absPath = filePath
  } else {
    // Strip leading slash and resolve from server root
    const relative = filePath.startsWith('/') ? filePath.slice(1) : filePath
    absPath = path.join(__dirname, '..', relative)
  }

  fs.unlink(absPath, (err) => {
    if (err && err.code !== 'ENOENT') {
      console.warn('⚠️  Could not delete file:', absPath, err.message)
    }
  })
}

/**
 * Delete multiple files — accepts array of relative/absolute paths
 * @param {string[]} filePaths
 */
function deleteFiles(filePaths) {
  if (!Array.isArray(filePaths)) return
  filePaths.forEach(deleteFile)
}

module.exports = { deleteFile, deleteFiles }
