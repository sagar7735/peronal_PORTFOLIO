const Testimonial = require('../models/Testimonial')
const asyncHandler = require('../utils/asyncHandler')
const ApiError = require('../utils/ApiError')
const { deleteFile } = require('../utils/deleteFile')
const { processAvatar } = require('../utils/imageProcessor')
const { testimonialSchema } = require('../validators/publicValidators')
const { reorderSchema } = require('../validators/skillValidators')

// GET /api/testimonials (public — approved only)
exports.getTestimonials = asyncHandler(async (req, res) => {
  const testimonials = await Testimonial.find({ approved: true }).sort({ order: 1, createdAt: -1 })
  res.json({ success: true, message: 'Testimonials fetched', data: testimonials })
})

// POST /api/testimonials (public — submit review)
exports.submitTestimonial = asyncHandler(async (req, res) => {
  let body = { ...req.body }
  if (body.rating) body.rating = Number(body.rating)
  const result = testimonialSchema.safeParse(body)
  if (!result.success) throw new ApiError(400, result.error.errors[0].message)

  let data = { ...result.data, approved: false }
  if (req.file) {
    data.avatar = await processAvatar(req.file.path, 'uploads/testimonials')
  }

  await Testimonial.create(data)
  res.status(201).json({ success: true, message: 'Thank you! Your review has been submitted for approval.', data: null })
})

// GET /api/testimonials/admin
exports.getAdminTestimonials = asyncHandler(async (req, res) => {
  const testimonials = await Testimonial.find().sort({ order: 1, createdAt: -1 })
  res.json({ success: true, message: 'Testimonials fetched', data: testimonials })
})

// PUT /api/testimonials/admin/:id
exports.updateTestimonial = asyncHandler(async (req, res) => {
  let body = { ...req.body }
  if (body.rating) body.rating = Number(body.rating)
  if (body.approved !== undefined) body.approved = body.approved === 'true' || body.approved === true

  const testimonial = await Testimonial.findById(req.params.id)
  if (!testimonial) throw new ApiError(404, 'Testimonial not found')

  if (req.file) {
    const old = testimonial.avatar
    body.avatar = await processAvatar(req.file.path, 'uploads/testimonials')
    if (old) deleteFile(old)
  }

  Object.assign(testimonial, body)
  await testimonial.save()
  res.json({ success: true, message: 'Testimonial updated', data: testimonial })
})

// DELETE /api/testimonials/admin/:id
exports.deleteTestimonial = asyncHandler(async (req, res) => {
  const testimonial = await Testimonial.findByIdAndDelete(req.params.id)
  if (!testimonial) throw new ApiError(404, 'Testimonial not found')
  if (testimonial.avatar) deleteFile(testimonial.avatar)
  res.json({ success: true, message: 'Testimonial deleted', data: null })
})

// PATCH /api/testimonials/admin/reorder
exports.reorderTestimonials = asyncHandler(async (req, res) => {
  const result = reorderSchema.safeParse(req.body)
  if (!result.success) throw new ApiError(400, result.error.errors[0].message)
  await Promise.all(result.data.map(({ id, order }) => Testimonial.findByIdAndUpdate(id, { order })))
  res.json({ success: true, message: 'Testimonials reordered', data: null })
})
