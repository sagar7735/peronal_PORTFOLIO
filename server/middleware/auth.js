const jwt = require('jsonwebtoken')
const asyncHandler = require('../utils/asyncHandler')
const ApiError = require('../utils/ApiError')
const Admin = require('../models/Admin')

// Verify JWT from httpOnly cookie
exports.protect = asyncHandler(async (req, res, next) => {
  const token = req.cookies?.token

  if (!token) {
    throw new ApiError(401, 'Not authenticated. Please log in.')
  }

  let decoded
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET)
  } catch (err) {
    throw new ApiError(401, err.name === 'TokenExpiredError' ? 'Session expired. Please log in again.' : 'Invalid token.')
  }

  const admin = await Admin.findById(decoded.id)
  if (!admin) {
    throw new ApiError(401, 'Admin account not found.')
  }

  req.admin = admin
  next()
})

// Must be used after protect
exports.adminOnly = (req, res, next) => {
  if (req.admin?.role !== 'admin') {
    throw new ApiError(403, 'Access denied. Admins only.')
  }
  next()
}
