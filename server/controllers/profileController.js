const Profile = require('../models/Profile')
const asyncHandler = require('../utils/asyncHandler')
const ApiError = require('../utils/ApiError')
const { deleteFile } = require('../utils/deleteFile')
const { processAvatar } = require('../utils/imageProcessor')
const { getRelativePath } = require('../utils/getRelativePath')
const { updateProfileSchema } = require('../validators/profileValidators')
const path = require('path')

// GET /api/profile (public)
exports.getProfile = asyncHandler(async (req, res) => {
  const profile = await Profile.findOne()
  if (!profile) throw new ApiError(404, 'Profile not found')
  res.json({ success: true, message: 'Profile fetched', data: profile })
})

// PUT /api/admin/profile (admin)
exports.updateProfile = asyncHandler(async (req, res) => {
  // Parse nested JSON fields sent as strings in FormData
  let body = { ...req.body }
  if (body.socialLinks && typeof body.socialLinks === 'string') {
    try { body.socialLinks = JSON.parse(body.socialLinks) } catch {}
  }
  if (body.stats && typeof body.stats === 'string') {
    try { body.stats = JSON.parse(body.stats) } catch {}
  }
  if (body.yearsOfExperience) body.yearsOfExperience = Number(body.yearsOfExperience)
  if (body.availableForFreelance !== undefined) body.availableForFreelance = body.availableForFreelance === 'true' || body.availableForFreelance === true

  const result = updateProfileSchema.safeParse(body)
  if (!result.success) throw new ApiError(400, result.error.errors[0].message)

  let profile = await Profile.findOne()
  if (!profile) throw new ApiError(404, 'Profile not found')

  // Handle avatar upload
  if (req.files?.avatar?.[0]) {
    const file = req.files.avatar[0]
    const oldAvatar = profile.avatar
    const webpPath = await processAvatar(file.path, 'uploads/avatars')
    result.data.avatar = webpPath
    if (oldAvatar) deleteFile(oldAvatar)
  }

  // Handle resume upload
  if (req.files?.resume?.[0]) {
    const file = req.files.resume[0]
    const oldResume = profile.resumeUrl
    result.data.resumeUrl = getRelativePath(file, 'uploads/resume')
    if (oldResume) deleteFile(oldResume)
  }

  Object.assign(profile, result.data)
  await profile.save()

  res.json({ success: true, message: 'Profile updated', data: profile })
})
