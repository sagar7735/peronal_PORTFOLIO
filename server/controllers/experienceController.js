const Experience = require('../models/Experience')
const asyncHandler = require('../utils/asyncHandler')
const ApiError = require('../utils/ApiError')
const { deleteFile } = require('../utils/deleteFile')
const { processAvatar } = require('../utils/imageProcessor')
const { createExperienceSchema, updateExperienceSchema, reorderSchema } = require('../validators/experienceValidators')

// GET /api/experience (public)
exports.getExperience = asyncHandler(async (req, res) => {
  const experience = await Experience.find().sort({ order: 1, startDate: -1 })
  res.json({ success: true, message: 'Experience fetched', data: experience })
})

// POST /api/admin/experience
exports.createExperience = asyncHandler(async (req, res) => {
  let body = { ...req.body }
  if (body.achievements && typeof body.achievements === 'string') {
    try { body.achievements = JSON.parse(body.achievements) } catch { body.achievements = [] }
  }
  if (body.techStack && typeof body.techStack === 'string') {
    try { body.techStack = JSON.parse(body.techStack) } catch { body.techStack = [] }
  }
  if (body.isCurrent !== undefined) body.isCurrent = body.isCurrent === 'true' || body.isCurrent === true

  const result = createExperienceSchema.safeParse(body)
  if (!result.success) throw new ApiError(400, result.error.errors[0].message)

  let data = { ...result.data }
  if (req.file) {
    data.companyLogo = await processAvatar(req.file.path, 'uploads/logos')
  }

  const exp = await Experience.create(data)
  res.status(201).json({ success: true, message: 'Experience created', data: exp })
})

// PUT /api/admin/experience/:id
exports.updateExperience = asyncHandler(async (req, res) => {
  let body = { ...req.body }
  if (body.achievements && typeof body.achievements === 'string') {
    try { body.achievements = JSON.parse(body.achievements) } catch { body.achievements = [] }
  }
  if (body.techStack && typeof body.techStack === 'string') {
    try { body.techStack = JSON.parse(body.techStack) } catch { body.techStack = [] }
  }
  if (body.isCurrent !== undefined) body.isCurrent = body.isCurrent === 'true' || body.isCurrent === true

  const result = updateExperienceSchema.safeParse(body)
  if (!result.success) throw new ApiError(400, result.error.errors[0].message)

  const exp = await Experience.findById(req.params.id)
  if (!exp) throw new ApiError(404, 'Experience not found')

  if (req.file) {
    const old = exp.companyLogo
    result.data.companyLogo = await processAvatar(req.file.path, 'uploads/logos')
    if (old) deleteFile(old)
  }

  Object.assign(exp, result.data)
  await exp.save()
  res.json({ success: true, message: 'Experience updated', data: exp })
})

// DELETE /api/admin/experience/:id
exports.deleteExperience = asyncHandler(async (req, res) => {
  const exp = await Experience.findByIdAndDelete(req.params.id)
  if (!exp) throw new ApiError(404, 'Experience not found')
  if (exp.companyLogo) deleteFile(exp.companyLogo)
  res.json({ success: true, message: 'Experience deleted', data: null })
})

// PATCH /api/admin/experience/reorder
exports.reorderExperience = asyncHandler(async (req, res) => {
  const result = reorderSchema.safeParse(req.body)
  if (!result.success) throw new ApiError(400, result.error.errors[0].message)
  await Promise.all(result.data.map(({ id, order }) => Experience.findByIdAndUpdate(id, { order })))
  res.json({ success: true, message: 'Experience reordered', data: null })
})
