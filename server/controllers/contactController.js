const ContactMessage = require('../models/ContactMessage')
const asyncHandler = require('../utils/asyncHandler')
const ApiError = require('../utils/ApiError')
const { contactMessageSchema } = require('../validators/publicValidators')

// POST /api/contact (public)
exports.sendMessage = asyncHandler(async (req, res) => {
  const result = contactMessageSchema.safeParse(req.body)
  if (!result.success) throw new ApiError(400, result.error.errors[0].message)

  const data = { ...result.data, ipAddress: req.ip }
  delete data.website // remove honeypot

  await ContactMessage.create(data)
  res.status(201).json({ success: true, message: 'Message sent successfully! I will get back to you soon.', data: null })
})

// GET /api/contact/admin
exports.getMessages = asyncHandler(async (req, res) => {
  const { isRead, isReplied, page = 1, limit = 20 } = req.query
  const filter = {}
  if (isRead !== undefined) filter.isRead = isRead === 'true'
  if (isReplied !== undefined) filter.isReplied = isReplied === 'true'

  const total = await ContactMessage.countDocuments(filter)
  const messages = await ContactMessage.find(filter)
    .sort({ isRead: 1, createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit))

  res.json({ success: true, message: 'Messages fetched', data: { messages, total, page: Number(page), pages: Math.ceil(total / limit) } })
})

// GET /api/contact/admin/:id
exports.getMessage = asyncHandler(async (req, res) => {
  const msg = await ContactMessage.findByIdAndUpdate(req.params.id, { isRead: true }, { new: true })
  if (!msg) throw new ApiError(404, 'Message not found')
  res.json({ success: true, message: 'Message fetched', data: msg })
})

// PATCH /api/contact/admin/:id
exports.updateMessage = asyncHandler(async (req, res) => {
  const { isRead, isReplied } = req.body
  const update = {}
  if (isRead !== undefined) update.isRead = isRead
  if (isReplied !== undefined) update.isReplied = isReplied
  const msg = await ContactMessage.findByIdAndUpdate(req.params.id, update, { new: true })
  if (!msg) throw new ApiError(404, 'Message not found')
  res.json({ success: true, message: 'Message updated', data: msg })
})

// DELETE /api/contact/admin/:id
exports.deleteMessage = asyncHandler(async (req, res) => {
  const msg = await ContactMessage.findByIdAndDelete(req.params.id)
  if (!msg) throw new ApiError(404, 'Message not found')
  res.json({ success: true, message: 'Message deleted', data: null })
})
