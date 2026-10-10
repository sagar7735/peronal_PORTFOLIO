const jwt = require('jsonwebtoken')
const Admin = require('../models/Admin')
const asyncHandler = require('../utils/asyncHandler')
const ApiError = require('../utils/ApiError')
const { loginSchema, changePasswordSchema } = require('../validators/authValidators')

// Helper: sign JWT and attach to httpOnly cookie
const sendTokenCookie = (res, adminId) => {
  const token = jwt.sign({ id: adminId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  })

  const isProduction = process.env.NODE_ENV === 'production'

  res.cookie('token', token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? (process.env.SAME_SITE || 'lax') : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  })

  return token
}

// POST /api/auth/login
exports.login = asyncHandler(async (req, res) => {
  const result = loginSchema.safeParse(req.body)
  if (!result.success) {
    throw new ApiError(400, result.error.errors[0].message)
  }

  const { email, password } = result.data

  const admin = await Admin.findOne({ email: email.toLowerCase() }).select('+password')
  if (!admin) {
    throw new ApiError(401, 'Invalid email or password')
  }

  const isMatch = await admin.comparePassword(password)
  if (!isMatch) {
    throw new ApiError(401, 'Invalid email or password')
  }

  admin.lastLogin = new Date()
  await admin.save({ validateBeforeSave: false })

  sendTokenCookie(res, admin._id)

  res.status(200).json({
    success: true,
    message: 'Logged in successfully',
    data: {
      id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      lastLogin: admin.lastLogin,
    },
  })
})

// POST /api/auth/logout
exports.logout = asyncHandler(async (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  })

  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
    data: null,
  })
})

// GET /api/auth/me
exports.getMe = asyncHandler(async (req, res) => {
  const admin = req.admin

  res.status(200).json({
    success: true,
    message: 'Admin fetched',
    data: {
      id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      lastLogin: admin.lastLogin,
    },
  })
})

// PUT /api/auth/change-password
exports.changePassword = asyncHandler(async (req, res) => {
  const result = changePasswordSchema.safeParse(req.body)
  if (!result.success) {
    throw new ApiError(400, result.error.errors[0].message)
  }

  const { currentPassword, newPassword } = result.data

  const admin = await Admin.findById(req.admin._id).select('+password')
  const isMatch = await admin.comparePassword(currentPassword)
  if (!isMatch) {
    throw new ApiError(400, 'Current password is incorrect')
  }

  admin.password = newPassword
  await admin.save()

  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  })

  res.status(200).json({
    success: true,
    message: 'Password changed successfully. Please log in again.',
    data: null,
  })
})
