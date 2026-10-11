const Project = require('../models/Project')
const asyncHandler = require('../utils/asyncHandler')
const ApiError = require('../utils/ApiError')
const { deleteFile, deleteFiles } = require('../utils/deleteFile')
const { processImage } = require('../utils/imageProcessor')
const { createProjectSchema, updateProjectSchema, reorderSchema } = require('../validators/projectValidators')
const path = require('path')

function generateSlug(title) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

// GET /api/projects (public) — with filters, pagination
exports.getProjects = asyncHandler(async (req, res) => {
  const { category, featured, search, page = 1, limit = 9 } = req.query
  const filter = { status: 'published' }
  if (category && category !== 'All') filter.category = category
  if (featured === 'true') filter.featured = true
  if (search) filter.$or = [
    { title: { $regex: search, $options: 'i' } },
    { shortDescription: { $regex: search, $options: 'i' } },
    { techStack: { $regex: search, $options: 'i' } },
  ]

  const total = await Project.countDocuments(filter)
  const projects = await Project.find(filter)
    .sort({ featured: -1, order: 1, createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit))

  res.json({
    success: true,
    message: 'Projects fetched',
    data: { projects, total, page: Number(page), pages: Math.ceil(total / limit) },
  })
})

// GET /api/projects/:slug (public)
exports.getProjectBySlug = asyncHandler(async (req, res) => {
  const project = await Project.findOne({ slug: req.params.slug, status: 'published' })
  if (!project) throw new ApiError(404, 'Project not found')

  // Previous and next
  const prev = await Project.findOne({ order: { $lt: project.order }, status: 'published' })
    .sort({ order: -1 }).select('title slug thumbnail')
  const next = await Project.findOne({ order: { $gt: project.order }, status: 'published' })
    .sort({ order: 1 }).select('title slug thumbnail')

  res.json({ success: true, message: 'Project fetched', data: { project, prev, next } })
})

// POST /api/projects (admin)
exports.createProject = asyncHandler(async (req, res) => {
  let body = { ...req.body }
  if (body.techStack && typeof body.techStack === 'string') {
    try { body.techStack = JSON.parse(body.techStack) } catch { body.techStack = [] }
  }
  if (body.featured !== undefined) body.featured = body.featured === 'true' || body.featured === true
  if (body.isClientProject !== undefined) body.isClientProject = body.isClientProject === 'true' || body.isClientProject === true

  const result = createProjectSchema.safeParse(body)
  if (!result.success) throw new ApiError(400, result.error.errors[0].message)

  let data = { ...result.data }

  // Auto-generate unique slug
  let slug = generateSlug(data.title)
  const existing = await Project.findOne({ slug })
  if (existing) slug = `${slug}-${Date.now()}`
  data.slug = slug

  // Thumbnail
  if (req.files?.thumbnail?.[0]) {
    data.thumbnail = await processImage(req.files.thumbnail[0].path, 'uploads/projects')
  }
  // Additional images
  if (req.files?.images?.length) {
    data.images = await Promise.all(
      req.files.images.map(f => processImage(f.path, 'uploads/projects'))
    )
  }

  const project = await Project.create(data)
  res.status(201).json({ success: true, message: 'Project created', data: project })
})

// PUT /api/projects/:id (admin)
exports.updateProject = asyncHandler(async (req, res) => {
  let body = { ...req.body }
  if (body.techStack && typeof body.techStack === 'string') {
    try { body.techStack = JSON.parse(body.techStack) } catch { body.techStack = [] }
  }
  if (body.featured !== undefined) body.featured = body.featured === 'true' || body.featured === true
  if (body.isClientProject !== undefined) body.isClientProject = body.isClientProject === 'true' || body.isClientProject === true

  const result = updateProjectSchema.safeParse(body)
  if (!result.success) throw new ApiError(400, result.error.errors[0].message)

  const project = await Project.findById(req.params.id)
  if (!project) throw new ApiError(404, 'Project not found')

  if (req.files?.thumbnail?.[0]) {
    const old = project.thumbnail
    result.data.thumbnail = await processImage(req.files.thumbnail[0].path, 'uploads/projects')
    if (old) deleteFile(old)
  }
  if (req.files?.images?.length) {
    const newImages = await Promise.all(
      req.files.images.map(f => processImage(f.path, 'uploads/projects'))
    )
    result.data.images = [...(project.images || []), ...newImages]
  }

  Object.assign(project, result.data)
  await project.save()
  res.json({ success: true, message: 'Project updated', data: project })
})

// DELETE /api/projects/:id/image (admin) — remove single image
exports.removeProjectImage = asyncHandler(async (req, res) => {
  const { imagePath } = req.body
  if (!imagePath) throw new ApiError(400, 'imagePath required')
  const project = await Project.findById(req.params.id)
  if (!project) throw new ApiError(404, 'Project not found')
  project.images = project.images.filter(img => img !== imagePath)
  await project.save()
  deleteFile(imagePath)
  res.json({ success: true, message: 'Image removed', data: project })
})

// DELETE /api/projects/:id (admin)
exports.deleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findByIdAndDelete(req.params.id)
  if (!project) throw new ApiError(404, 'Project not found')
  if (project.thumbnail) deleteFile(project.thumbnail)
  if (project.images?.length) deleteFiles(project.images)
  res.json({ success: true, message: 'Project deleted', data: null })
})

// PATCH /api/projects/reorder (admin)
exports.reorderProjects = asyncHandler(async (req, res) => {
  const result = reorderSchema.safeParse(req.body)
  if (!result.success) throw new ApiError(400, result.error.errors[0].message)
  await Promise.all(result.data.map(({ id, order }) => Project.findByIdAndUpdate(id, { order })))
  res.json({ success: true, message: 'Projects reordered', data: null })
})

// GET /api/projects/admin (admin) — all including drafts
exports.getAdminProjects = asyncHandler(async (req, res) => {
  const { status, category, search, page = 1, limit = 20 } = req.query
  const filter = {}
  if (status) filter.status = status
  if (category && category !== 'All') filter.category = category
  if (search) filter.$or = [
    { title: { $regex: search, $options: 'i' } },
    { shortDescription: { $regex: search, $options: 'i' } },
  ]
  const total = await Project.countDocuments(filter)
  const projects = await Project.find(filter)
    .sort({ order: 1, createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit))
  res.json({ success: true, message: 'Projects fetched', data: { projects, total, page: Number(page), pages: Math.ceil(total / limit) } })
})
