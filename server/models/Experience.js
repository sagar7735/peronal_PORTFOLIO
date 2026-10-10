const mongoose = require('mongoose')

const experienceSchema = new mongoose.Schema(
  {
    company: { type: String, required: true, trim: true },
    role: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ['Full-time', 'Freelance', 'Internship', 'Part-time'],
      default: 'Full-time',
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    isCurrent: { type: Boolean, default: false },
    description: { type: String, trim: true },
    achievements: [{ type: String }],
    techStack: [{ type: String }],
    companyLogo: { type: String, default: '' },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Experience', experienceSchema)
