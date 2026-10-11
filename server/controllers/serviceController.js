const Service = require('../models/Service')
const asyncHandler = require('../utils/asyncHandler')
const ApiError = require('../utils/ApiError')
const { createServiceSchema, updateServiceSchema, reorderSchema } = require('../validators/serviceValidators')

// GET /api/services (public — active only)
exports.getServices = asyncHandler(async (req, res) => {
  const services = await Service.find({ active: true }).sort({ order: 1 })
  res.json({ success: true, message: 'Services fetched', data: services })
})

// GET /api/services/admin (admin — all)
exports.getAdminServices = asyncHandler(async (req, res) => {
  const services = await Service.find().sort({ order: 1 })
  res.json({ success: true, message: 'Services fetched', data: services })
})

// POST /api/services/admin
exports.createService = asyncHandler(async (req, res) => {
  let body = { ...req.body }
  if (body.features && typeof body.features === 'string') {
    try { body.features = JSON.parse(body.features) } catch { body.features = [] }
  }
  if (body.startingPrice) body.startingPrice = Number(body.startingPrice)
  if (body.active !== undefined) body.active = body.active === 'true' || body.active === true
  const result = createServiceSchema.safeParse(body)
  if (!result.success) throw new ApiError(400, result.error.errors[0].message)
  const service = await Service.create(result.data)
  res.status(201).json({ success: true, message: 'Service created', data: service })
})

// PUT /api/services/admin/:id
exports.updateService = asyncHandler(async (req, res) => {
  let body = { ...req.body }
  if (body.features && typeof body.features === 'string') {
    try { body.features = JSON.parse(body.features) } catch { body.features = [] }
  }
  if (body.startingPrice) body.startingPrice = Number(body.startingPrice)
  if (body.active !== undefined) body.active = body.active === 'true' || body.active === true
  const result = updateServiceSchema.safeParse(body)
  if (!result.success) throw new ApiError(400, result.error.errors[0].message)
  const service = await Service.findByIdAndUpdate(req.params.id, result.data, { new: true, runValidators: true })
  if (!service) throw new ApiError(404, 'Service not found')
  res.json({ success: true, message: 'Service updated', data: service })
})

// DELETE /api/services/admin/:id
exports.deleteService = asyncHandler(async (req, res) => {
  const service = await Service.findByIdAndDelete(req.params.id)
  if (!service) throw new ApiError(404, 'Service not found')
  res.json({ success: true, message: 'Service deleted', data: null })
})

// PATCH /api/services/admin/reorder
exports.reorderServices = asyncHandler(async (req, res) => {
  const result = reorderSchema.safeParse(req.body)
  if (!result.success) throw new ApiError(400, result.error.errors[0].message)
  await Promise.all(result.data.map(({ id, order }) => Service.findByIdAndUpdate(id, { order })))
  res.json({ success: true, message: 'Services reordered', data: null })
})
