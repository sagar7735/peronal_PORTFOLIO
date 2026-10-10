const mongoose = require('mongoose')

const analyticsSchema = new mongoose.Schema(
  {
    page: { type: String, required: true },
    date: { type: String, required: true },
    count: { type: Number, default: 1 },
  },
  { timestamps: true }
)

analyticsSchema.index({ page: 1, date: 1 }, { unique: true })

module.exports = mongoose.model('Analytics', analyticsSchema)
