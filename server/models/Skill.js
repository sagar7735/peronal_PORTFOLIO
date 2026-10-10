const mongoose = require('mongoose')

const skillSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ['Frontend', 'Backend', 'Mobile', 'Database', 'Tools'],
      required: true,
    },
    level: { type: Number, min: 0, max: 100, default: 80 },
    icon: { type: String, default: '' },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
)

skillSchema.index({ category: 1, order: 1 })

module.exports = mongoose.model('Skill', skillSchema)
