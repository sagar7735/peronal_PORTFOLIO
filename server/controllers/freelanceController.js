const FreelanceApplication = require('../models/FreelanceApplication')
const Profile = require('../models/Profile')
const asyncHandler = require('../utils/asyncHandler')
const ApiError = require('../utils/ApiError')
const { deleteFile } = require('../utils/deleteFile')
const { getRelativePath } = require('../utils/getRelativePath')
const { freelanceApplicationSchema } = require('../validators/publicValidators')
const path = require('path')
const fs = require('fs')
const { notifyAdminNewApplication, autoReplyApplicant } = require('../utils/emailService')

// POST /api/freelance/apply (public)
exports.submitApplication = asyncHandler(async (req, res) => {
  let body = { ...req.body }
  if (body.referenceLinks && typeof body.referenceLinks === 'string') {
    try { body.referenceLinks = JSON.parse(body.referenceLinks) } catch { body.referenceLinks = [] }
  }

  const result = freelanceApplicationSchema.safeParse(body)
  if (!result.success) throw new ApiError(400, result.error.errors[0].message)

  const profile = await Profile.findOne().select('availableForFreelance')
  const isWaitlist = !profile?.availableForFreelance

  let data = {
    ...result.data,
    isWaitlist,
    ipAddress: req.ip,
    attachmentPath: '',
  }
  // Remove honeypot field before saving
  delete data.website

  if (req.file) {
    data.attachmentPath = getRelativePath(req.file, 'private-uploads/freelance-attachments')
  }

  const savedApp = await FreelanceApplication.create(data)

  // Non-blocking emails — fire and forget
  notifyAdminNewApplication(savedApp)
  autoReplyApplicant(savedApp)

  const msg = isWaitlist
    ? 'You have been added to the waitlist. I will reach out when I become available.'
    : 'Your project request has been submitted! I will get back to you within 24-48 hours.'

  res.status(201).json({ success: true, message: msg, data: null })
})

// GET /api/freelance/admin (admin)
exports.getApplications = asyncHandler(async (req, res) => {
  const { status, projectType, isWaitlist, search, startDate, endDate, page = 1, limit = 20 } = req.query
  const filter = {}
  if (status) filter.status = status
  if (projectType) filter.projectType = projectType
  if (isWaitlist !== undefined) filter.isWaitlist = isWaitlist === 'true'
  if (search) filter.$or = [
    { clientName: { $regex: search, $options: 'i' } },
    { email: { $regex: search, $options: 'i' } },
  ]
  if (startDate || endDate) {
    filter.createdAt = {}
    if (startDate) filter.createdAt.$gte = new Date(startDate)
    if (endDate) filter.createdAt.$lte = new Date(endDate)
  }

  const total = await FreelanceApplication.countDocuments(filter)
  const applications = await FreelanceApplication.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit))

  res.json({ success: true, message: 'Applications fetched', data: { applications, total, page: Number(page), pages: Math.ceil(total / limit) } })
})

// GET /api/freelance/admin/:id
exports.getApplication = asyncHandler(async (req, res) => {
  const app = await FreelanceApplication.findById(req.params.id)
  if (!app) throw new ApiError(404, 'Application not found')
  res.json({ success: true, message: 'Application fetched', data: app })
})

// PATCH /api/freelance/admin/:id
exports.updateApplication = asyncHandler(async (req, res) => {
  const { status, adminNotes, sendEmail: shouldSendEmail } = req.body
  const app = await FreelanceApplication.findById(req.params.id)
  if (!app) throw new ApiError(404, 'Application not found')
  if (status) app.status = status
  if (adminNotes !== undefined) app.adminNotes = adminNotes
  await app.save()

  // Optionally send status update email to client
  if (shouldSendEmail && status) {
    const { sendStatusEmail } = require('../utils/emailService')
    sendStatusEmail(app, status)
  }

  res.json({ success: true, message: 'Application updated', data: app })
})

// DELETE /api/freelance/admin/:id
exports.deleteApplication = asyncHandler(async (req, res) => {
  const app = await FreelanceApplication.findByIdAndDelete(req.params.id)
  if (!app) throw new ApiError(404, 'Application not found')
  if (app.attachmentPath) deleteFile(app.attachmentPath)
  res.json({ success: true, message: 'Application deleted', data: null })
})

// GET /api/freelance/admin/:id/attachment (secure stream — admin only)
exports.downloadAttachment = asyncHandler(async (req, res) => {
  const app = await FreelanceApplication.findById(req.params.id)
  if (!app) throw new ApiError(404, 'Application not found')
  if (!app.attachmentPath) throw new ApiError(404, 'No attachment for this application')

  const relPath = app.attachmentPath.startsWith('/')
    ? app.attachmentPath.slice(1)
    : app.attachmentPath
  const absPath = path.join(__dirname, '..', relPath)

  if (!fs.existsSync(absPath)) throw new ApiError(404, 'Attachment file not found on disk')

  res.download(absPath)
})

// GET /api/freelance/admin/export (CSV)
exports.exportApplications = asyncHandler(async (req, res) => {
  const applications = await FreelanceApplication.find().sort({ createdAt: -1 })

  const headers = ['Name', 'Email', 'Phone', 'Company', 'Project Type', 'Budget', 'Timeline', 'Status', 'Waitlist', 'Submitted']
  const rows = applications.map(a => [
    a.clientName, a.email, a.phone || '', a.company || '',
    a.projectType, a.budgetRange, a.timeline || '',
    a.status, a.isWaitlist ? 'Yes' : 'No',
    new Date(a.createdAt).toLocaleDateString(),
  ])

  const csv = [headers, ...rows]
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n')

  res.setHeader('Content-Type', 'text/csv')
  res.setHeader('Content-Disposition', 'attachment; filename="freelance-applications.csv"')
  res.send(csv)
})
