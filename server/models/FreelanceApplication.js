const mongoose = require('mongoose')

const freelanceApplicationSchema = new mongoose.Schema(
  {
    clientName: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    company: { type: String, trim: true },
    projectType: {
      type: String,
      enum: ['Website', 'Web App', 'Mobile App', 'E-commerce', 'UI Redesign', 'Other'],
      required: true,
    },
    budgetRange: { type: String, required: true },
    timeline: { type: String },
    description: { type: String, required: true, trim: true },
    referenceLinks: [{ type: String }],
    attachmentPath: { type: String, default: '' },
    preferredContact: {
      type: String,
      enum: ['Email', 'Phone', 'WhatsApp'],
      default: 'Email',
    },
    status: {
      type: String,
      enum: ['new', 'reviewing', 'accepted', 'in-progress', 'completed', 'rejected'],
      default: 'new',
    },
    adminNotes: { type: String, default: '' },
    isWaitlist: { type: Boolean, default: false },
    ipAddress: { type: String },
  },
  { timestamps: true }
)

freelanceApplicationSchema.index({ status: 1 })
freelanceApplicationSchema.index({ createdAt: -1 })

module.exports = mongoose.model('FreelanceApplication', freelanceApplicationSchema)
