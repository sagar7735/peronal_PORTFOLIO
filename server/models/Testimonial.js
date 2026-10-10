const mongoose = require('mongoose')

const testimonialSchema = new mongoose.Schema(
  {
    clientName: { type: String, required: true, trim: true },
    clientRole: { type: String, trim: true },
    company: { type: String, trim: true },
    avatar: { type: String, default: '' },
    rating: { type: Number, min: 1, max: 5, default: 5 },
    message: { type: String, required: true, trim: true },
    approved: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
)

testimonialSchema.index({ approved: 1, order: 1 })

module.exports = mongoose.model('Testimonial', testimonialSchema)
